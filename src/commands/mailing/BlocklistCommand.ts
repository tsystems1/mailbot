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

import { Message, CommandInteraction, CacheType, ChatInputCommandInteraction, EmbedBuilder, Utils, escapeMarkdown } from "discord.js";
import Client from "../../client/Client";
import BlockedUser from "../../models/BlockedUser";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { formatDistance, formatDistanceToNowStrict, subDays } from 'date-fns';
import Paginator from "../../utils/Paginator";

export default class BlocklistCommand extends BaseCommand {
    constructor() {
        super('blocklist', 'mailing', ['blk']);
    }

    async run(client: Client, message: Message<boolean> | CommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        if (message instanceof ChatInputCommandInteraction) 
            await message.deferReply();

        const data = await BlockedUser.find().limit(10);

        if (data.length < 1) {
            await this.deferedReply(message, {
                content: "No blocked user found."
            });

            return;
        }

        const paginator = new Paginator(data, {
            channel_id: message.channelId!,
            guild_id: message.guildId!,
            limit: 10,
            timeout: 120_000,
            user_id: message.member?.user.id,
            embedBuilder(options) {
                let description = "";

                for (const row of options.data) {
                    description += `<@${row.discordID}> - \`${escapeMarkdown(row.reason ?? 'No reason provided')}\` - ${formatDistanceToNowStrict(row.createdAt, { addSuffix: true })}, at ${row.createdAt.toUTCString()}\n`;
                }

                return new EmbedBuilder({
                    title: "Blocked Users",
                    description,
                    color: 0x007bff,
                    footer: { text: `Page ${options.currentPage} of ${options.maxPages}` }
                });
            },
            async fetchData(options) {
                return await BlockedUser.find().skip(options.offset).limit(options.limit)
            },
        });

        await this.deferedReply(message, await paginator.getMessageOptions());

        let reply = <Message> message;

        if (message instanceof ChatInputCommandInteraction) {
            reply = await message.fetchReply();
        }

        await paginator.start(reply);
    }
}