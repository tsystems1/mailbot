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

import { Message, CommandInteraction, CacheType, EmbedBuilder, ChatInputCommandInteraction, ChannelType, TextChannel } from "discord.js";
import Client from "../../client/Client";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";

export default class EvalCommand extends BaseCommand {
    requireModRole = true;
    
    constructor() {
        super('eval', 'utils', ['exec']);
    }

    async run(client: Client, message: Message | ChatInputCommandInteraction<CacheType>, options: CommandOptions | undefined): Promise<void> {
        const code = message instanceof ChatInputCommandInteraction ? message.options.getString('code') : options!.args.join(' ');

        if (!code?.trim()) {
            await message.reply(':x: You must specify a code to run.');
            return;
        }

        if (message instanceof ChatInputCommandInteraction)
            await message.deferReply({ ephemeral: true });

        try {
            eval(code);

            await this.deferedReply(message, {
                content: 'Execution complete!'
            })
        }
        catch (e) {
            await this.deferedReply(message, {
                content: 'There was an error while executing the code.\n\n```\n' + (e as any).message + '\n```'
            })
        }
    }
}