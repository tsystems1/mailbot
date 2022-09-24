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

import { ChatInputCommandInteraction, CommandInteraction, Embed, EmbedBuilder, GuildChannel, Message, User } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import Thread from '../../models/Thread';
import { getChannel, getGuild, loggingChannel } from '../../utils/utils';
import { closeThread } from './CloseCommand';

export default class DeleteCommand extends BaseCommand {
    mailOnly = true;
    requireModRole = true;

    constructor() {
        super('delete', 'mailing', ['dt']);
    }

    async run(client: DiscordClient, message: Message | CommandInteraction, options?: CommandOptions) {
        let reason: string | null = null;

        if (message instanceof CommandInteraction && message.isChatInputCommand()) {
            reason = message.options.getString('reason');
            await message.deferReply();
        }
        else if (options) {
            reason = options.rawArgs.filter(a => a[0] !== '-').join(' ').trim();
            reason = reason === '' ? null : reason;
        }

        const { channel } = message;

        await closeThread(client, message.channel!.id, message.member!.user as User, {
            dm: true,
            reason,
        });

        try {
            if ((channel as GuildChannel).parent?.id !== client.config.mail_category)
                return;

            await loggingChannel(client).send({
                embeds: [
                    new EmbedBuilder({
                        color: 0x007bff,
                        title: 'Thread deleted',
                        fields: [
                            {
                                name: 'Channel ID',
                                value: channel!.id + ''
                            },
                            {
                                name: 'Deleted by',
                                value: (message.member?.user as User).tag + ` (${(message.member?.user as User).id})`
                            },
                            {
                                name: 'Reason',
                                value: `${reason ?? '*No reason provided*'}`
                            },
                        ],
                        footer: {
                            text: 'Deleted'
                        }
                    })
                    .setTimestamp()
                ]
            });

            await message.channel?.delete();
        }
        catch (e) {
            console.log(e);

            this.deferedReply(message, {
                embeds: [
                    {
                        description: ':x: Cannot delete this channel, probably not a mailbot thread or missing permissions?',
                        color: 0xf14a60
                    }
                ]
            }).catch(console.error);
        }
    }
}