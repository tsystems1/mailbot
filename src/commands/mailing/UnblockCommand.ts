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

import { Message, CommandInteraction, CacheType, EmbedBuilder, GuildMember, ChatInputCommandInteraction, escapeMarkdown, User } from "discord.js";
import Client from "../../client/Client";
import BlockedUser from "../../models/BlockedUser";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { getGlobalUser, getGuild, getUser, loggingChannel } from "../../utils/utils";

export default class UnblockCommand extends BaseCommand {
    requireModRole = true;
    
    constructor() {
        super('unblock', 'mailing', ['unblk']);
    }

    async run(client: Client, message: Message<boolean> | ChatInputCommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        if (options && options.args[0] === undefined) {
            await message.reply({
                embeds: [
                    {
                        description: ':x: You must specify a user to unblock.',
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }

        let user: User | undefined;
        let reason: string | undefined;
        const notify = message instanceof Message ? (options?.options["-n"] ?? options?.options["--notify"] ?? false) : (message.options.getBoolean('notify') ?? false);

        if (options) {
            user = await getGlobalUser(options.args[0]);
        }
        else if (message instanceof CommandInteraction) {
            user = message.options.getUser('user')! as User;
            reason = message.options.getString('reason') ?? undefined;
        }

        if (!user || user.bot) {
            await message.reply({
                embeds: [
                    {
                        description: ':x: Invalid member specified.' + (user?.bot ? ' You cannot do that with a Bot user.' : ''),
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }

        const blockedUser = await BlockedUser.findOne({ discordID: user.id });

        if (!blockedUser) {
            await message.reply({
                embeds: [
                    {
                        description: ':x: This user is not blocked!',
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }

        await blockedUser.delete();

        await loggingChannel(client).send({
            embeds: [
                new EmbedBuilder({
                    author: {
                        name: user.tag,
                        iconURL: user.displayAvatarURL()
                    },
                    title: "User unblocked",
                    fields: [
                        {
                            name: "User ID",
                            value: user.id,
                        },
                        {
                            name: "Unblocked By",
                            value: `${(message.member?.user as User).tag} (${message.member?.user.id})`,
                        },
                        {
                            name: "Reason",
                            value: `${reason ? escapeMarkdown(reason) : "*No reason provided*"}`
                        }
                    ],
                    color: 0xf14a60,
                    footer: {
                        text: 'Unblocked'
                    }
                })
                .setTimestamp()
            ]
        });

        if (notify) {
            try {
                await user.send({
                    embeds: [
                        new EmbedBuilder({
                            author: {
                                name: 'You have been unblocked',
                                iconURL: client.user?.displayAvatarURL()
                            },
                            description: 'You have been unblocked from using MailBot.',
                            fields: reason ? [
                                {
                                    name: "Reason",
                                    value: `${escapeMarkdown(reason)}`
                                }
                            ] : [],
                            footer: {
                                text: 'Unblocked',
                                iconURL: getGuild(client)!.iconURL() ?? undefined
                            },
                            color: 0xf14a60
                        })
                        .setTimestamp()
                    ]
                });
            }
            catch (e) {
                console.log(e);
            }
        }

        await message.reply({
            embeds: [
                new EmbedBuilder({
                    author: {
                        name: user.tag,
                        icon_url: user.displayAvatarURL(),
                    },
                    description: 'This user was unblocked. They will be able to communicate with MailBot again.',
                    fields: reason ? [
                        {
                            name: "Reason",
                            value: `${escapeMarkdown(reason)}`
                        }
                    ] : [],
                    footer: {
                        text: 'Unblocked'
                    },
                    color: 0x007bff
                })
                .setTimestamp()
            ]
        });
    }
}