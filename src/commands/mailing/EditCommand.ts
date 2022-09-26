/**
* This file is part of MailBot.
* 
* Copyright (C) 2021-2022 OSN Inc.
*
* MailBot is free software; you can redistribute it and/or modify it
* under the terms of the GNU Affero General Public License as published by 
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* MailBot is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of 
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License 
* along with MailBot. If not, see <https://www.gnu.org/licenses/>.
*/

import { Message, CommandInteraction, CacheType, EmbedBuilder, Attachment, TextChannel, ChatInputCommandInteraction, User, Embed, Colors } from "discord.js";
import Client from "../../client/Client";
import StaffMessage from "../../models/StaffMessage";
import Thread, { IThread } from "../../models/Thread";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { getChannel, getGuild, loggingChannel } from "../../utils/utils";

export async function updateReply(client: Client, thread: IThread, id: string, { content, author }: { content: string, author: User }) {
    const channel = getChannel(client, thread!.channel) as TextChannel;

    try {
        const user = await (getGuild(client)?.members.fetch(thread.user));

        if (!user) {
            return;
        }

        let message: Message | undefined;
        let staffMessage = await StaffMessage.findOne({ threadMessageID: id });

        if (!staffMessage) {
            console.log("Not found");
            return false;
        }

        if (staffMessage.authorID !== author.id) {
            return 101;
        }

        let isAnonymous: boolean = true;
        let origEmbed: Embed | undefined;

        try {
            if (!user.dmChannel) {
                console.log('Reloading DM channel...');

                try {
                    await user.createDM(true);
                }
                catch (e) {
                    console.log(e);
                }
            }

            message = await user.dmChannel!.messages.fetch(staffMessage!.dmID);

            console.log(message);

            if (!message) {
                return false;
            }

            const { embeds } = message;
            
            origEmbed = embeds.shift();

            isAnonymous = origEmbed?.author?.name === 'Staff';

            await message.edit({
                embeds: [
                    new EmbedBuilder({
                        author: {
                            name: isAnonymous ? 'Staff' : author.tag,
                            iconURL: isAnonymous ? client.user!.displayAvatarURL() : author.displayAvatarURL()
                        },
                        description: (content ?? '').trim() === '' ? '*No content*' : content,
                        footer: { text: `Received`, iconURL: getGuild(client)!.iconURL() ?? undefined },
                        color: 0x007bff
                    })
                    .setTimestamp(),
                    ...embeds
                ]
            });
        }
        catch (e) {
            console.log(e);
            return null;
        }

        const prevEmbed = new EmbedBuilder({
            author: {
                name: author.tag,
                iconURL: author.displayAvatarURL()
            },
            description: (origEmbed?.description ?? '').trim() === '' ? '*No content*' : (origEmbed?.description ?? undefined),
            footer: { text: `${isAnonymous ? 'Anonymous' : 'Normal'} Reply (Previous) • ${message.id}` },
            color: Colors.Gold
        }).setTimestamp();

        const embed = new EmbedBuilder({
            author: {
                name: author.tag,
                iconURL: author.displayAvatarURL()
            },
            description: (content ?? '').trim() === '' ? '*No content*' : content,
            footer: { text: `${isAnonymous ? 'Anonymous' : 'Normal'} Reply (Updated) • ${message.id}` },
            color: 0x007bff,
            fields: [
                {
                    name: 'Original Message',
                    value: `[Jump](https://discord.com/channels/${getGuild(client)!.id}/${channel.id}/${id})`
                }
            ]
        }).setTimestamp();

        if (channel) {
            await channel.send({
                embeds: [
                    embed,
                ]
            });
        }

        await (loggingChannel(client).send({
            embeds: [
                new EmbedBuilder({
                    author: author ? {
                        name: author.tag,
                        iconURL: author.displayAvatarURL()
                    } : undefined,
                    title: 'Reply Updated',
                    description: 'A message was updated by **' + author.tag + '**.',
                    fields: [
                        {
                            name: 'Thread ID',
                            value: thread.id
                        },
                        {
                            name: 'Channel ID',
                            value: thread.channel
                        },
                        {
                            name: 'DM ID',
                            value: staffMessage.dmID
                        },
                        {
                            name: 'Thread Message ID',
                            value: id
                        },
                        {
                            name: 'Sent to',
                            value: user!.user.tag + ` (${user!.user.id})`
                        },
                    ],
                    footer: {
                        text: `Updated`
                    },
                    color: 0x007bff
                })
                .setTimestamp(),
                prevEmbed,
                embed,
            ]
        }));

        return { channel, message, member: user };
    }
    catch (e) {
        console.log(e);     
    }
}

export default class EditCommand extends BaseCommand {   
    public mailOnly: boolean = true;

    constructor() {
        super('edit', 'mailing', ['u', 'um', 'updatemsg', 'e', 'update', 'editmsg']);
    }

    async run(client: Client, message: Message<boolean> | ChatInputCommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        if (options && options.args[1] === undefined) {
            await message.reply({
                embeds: [
                    {
                        description: ':x: You must specify a message ID and the new content to edit.',
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }
        
        let content = '', id = '';

        if (options) {
            const [newId, ...args] = options.rawArgs;
            id = newId;
            content = args.join(' ');
        }
        else if (message instanceof ChatInputCommandInteraction) {
            content = message.options.getString('content')!;
            id = message.options.getString('message')!;
            await message.deferReply({ ephemeral: true });
        }

        const thread = await Thread.findOne({ channel: message.channel!.id });

        if (!thread) {
            await this.deferedReply(message, {
                content: ':x: This thread is already closed or deleted.'
            });

            return;
        }

        const result = await updateReply(client, thread, id, {
            content,
            author: message.member!.user as User,
        });

        if (result === false) {
            this.deferedReply(message, ":x: The given message does not exist.");
        }
        else if (result === 101) {
            this.deferedReply(message, ":x: You can only edit messages sent by you!");
        }
        else if (message instanceof ChatInputCommandInteraction) {
            this.deferedReply(message, "Message updated successfully.");
        }
    }
}