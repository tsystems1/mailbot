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

export default class EchoCommand extends BaseCommand {
    requireModRole = true;

    public readonly legacy: boolean = false;
    
    constructor() {
        super('echo', 'utils', ['say']);
    }

    async run(client: Client, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const content = interaction.options.getString('content', true);
        const channel = interaction.options.getChannel('channel') as TextChannel | undefined;

        await interaction.deferReply({ ephemeral: true });

        if (channel && channel.type !== ChannelType.GuildText && channel.type !== ChannelType.PublicThread && channel.type !== ChannelType.PrivateThread) {
            await interaction.editReply("Invalid channel given.");
            return;
        }

        await (channel ?? interaction.channel! as TextChannel).send({
            content
        });

        await interaction.editReply("Message sent.");
    }
}