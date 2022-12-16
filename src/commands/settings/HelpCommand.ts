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

import { Message, CommandInteraction, CacheType, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import Client from "../../client/Client";
import CommandOptions from "../../types/CommandOptions";
import Paginator from "../../utils/Paginator";
import BaseCommand from "../../utils/structures/BaseCommand";

type CommandData = {
    name: string;
    description: string;
    details?: string;
    notes?: string;
    syntax?: string;
    options?: { [option: string]: string };
    example: string;
};

const commands: CommandData[] = [
    {
        name: 'a',
        description: 'Sends an anonymous reply. You must be in the thread channel to run this command!',
        example: '%%a hey!'
    },
    {
        name: 'block',
        description: 'Block users from DMing MailBot.',
        syntax: "`<user>`",
        options: {
            '-n, --notify': 'Notify the user that they have been blocked'
        },
        example: `%%block @Someone\n%%block 7846247524764784`
    },
    {
        name: 'blocklist',
        description: 'View the blocked users.',
        example: `%%blocklist`
    },
    {
        name: 'close',
        description: 'Closes the current thread. You must be in the thread channel to run this command!',
        options: {
            '-d, --delete': 'Delete the thread channel'
        },
        syntax: "`[query]`",
        example: `%%close\n%%close -d\n%%close in 12 hours silently`
    },
    {
        name: 'delete',
        description: 'Deletes a thread channel. You must be in the thread channel to run this command!',
        example: `%%delete`
    },
    {
        name: 'edit',
        description: 'Edits a thread message. You must be in the thread channel to run this command!',
        syntax: "`<message_id> <new_content>`",
        example: `%%edit 3464656245625643 test`
    },
    {
        name: 'help',
        description: 'Shows this help.',
        example: '%%help\n%%help reply'
    },
    {
        name: 'reply',
        description: 'Sends a normal reply. You must be in the thread channel to run this command!',
        details: 'Aliases: `r`',
        syntax: "`<message>`",
        example: '%%reply hey!'
    },
    {
        name: 'send',
        description: 'Sends an anonymous message to a user, if there is no thread, the system will create one. Use this when you want to start a conversation.',
        details: 'Aliases: `sa`',
        syntax: "`<user> <message>`",
        example: '%%send @test hey!'
    },
    {
        name: 'sr',
        description: 'Sends a normal message to a user, if there is no thread, the system will create one. Use this when you want to start a conversation.',
        details: 'Aliases: `s`',
        syntax: "`<user> <message>`",
        example: '%%sr @test hey!'
    },
    {
        name: 'thread',
        description: 'Create a new thread conversation with a user.',
        syntax: "`<user> [initial_message]`",
        example: `%%thread @test`
    },
    {
        name: 'unblock',
        description: 'Remove users from the blocklist.',
        syntax: "`<user>`",
        options: {
            '-n, --notify': 'Notify the user that they have been unblocked'
        },
        example: `%%unblock @Someone\n%%unblock 7846247524764784`
    }
];

export default class HelpCommand extends BaseCommand {
    requireModRole = true;

    constructor() {
        super('help', 'settings', ['?', 'howto', 'commands']);
    }

    async run(client: Client, message: Message<boolean> | ChatInputCommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        const commandName = message instanceof Message ? options!.args[0] : message.options.getString('command_name');

        if (!commandName) {
            const paginator = new Paginator(commands, {
                channel_id: message.channelId!,
                guild_id: message.guildId!,
                limit: 10,
                user_id: message.member!.user.id,
                embedBuilder(options) {
                    let str = '';

                    for (const row of options.data) {
                        str += `**${client.config.prefix}${row.name}**\n${row.description}\n\n`;
                    }

                    return new EmbedBuilder({
                        title: 'Help',
                        color: 0x007bff,
                        description: str,
                        footer: { text: `Page ${options.currentPage} of ${options.maxPages}` }
                    })
                },
                timeout: 180_000
            });

            let reply = await message.reply(await paginator.getMessageOptions());

            if (message instanceof ChatInputCommandInteraction) {
                reply = await message.fetchReply();
            }

            await paginator.start(reply as Message);
        }
        else {
            const command = commands.find(c => c.name === commandName);

            if (!command) {
                await message.reply("Couldn't find that command. Make sure that it is spelled correctly?");
                return;
            }

            await message.reply({
                embeds: [
                    new EmbedBuilder({
                        title: `${client.config.prefix}${command.name}`,
                        color: 0x007bff,
                        description: `${command.description}\n\n${command.details ? `${command.details}\n\n` : ''}`,
                        fields: [
                            {
                                name: 'Syntax',
                                value: `${client.config.prefix}${command.name}${command.syntax ?? ''}`
                            },
                            ...(command.options ? [
                                {
                                    name: 'Options',
                                    value: Object.entries(command.options).reduce((acc, opt) => `${acc}\n\`${opt[0]}\`: ${opt[1]}`, '')
                                }
                            ] : []),
                            {
                                name: 'Examples',
                                value: command.example.replace(/\%\%/g, client.config.prefix)
                            }
                        ],
                        footer: { text: 'Viewing Command Guide' }
                    })
                    .setTimestamp()
                ]
            });
        }
    }
}
