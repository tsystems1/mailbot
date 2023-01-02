/**
* This file is part of MailBot.
* 
* Copyright (C) 2021-2022 OSN Inc.
*
* SudoBot is free software; you can redistribute it and/or modify it
* under the terms of the GNU Affero General Public License as published by 
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* SudoBot is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of 
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License 
* along with SudoBot. If not, see <https://www.gnu.org/licenses/>.
*/

import { CommandInteraction, InteractionCollector, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, InteractionType, Colors } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';

export default class RestartCommand extends BaseCommand {
    ownerOnly = true;

    constructor() {
        super('restart', 'settings', []);
    }

    async run(client: DiscordClient, interaction: CommandInteraction, options: undefined) {
        const row = new ActionRowBuilder<ButtonBuilder>();

        row.addComponents([
            new ButtonBuilder()
            .setCustomId('restart:true')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
            .setCustomId('restart:false')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger)
        ]);

        const disabledRow = new ActionRowBuilder<ButtonBuilder>();

        await disabledRow.addComponents([
            new ButtonBuilder()
            .setCustomId('restart:true')
            .setLabel('Restart')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true),
            new ButtonBuilder()
            .setCustomId('restart:false')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true)
        ]);

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle('System Restart')
                .setColor(Colors.Gold)
                .setDescription('Are you sure to restart the system? This will restart the whole bot system including the backend API and might take up to a minute.')
            ],
            components: [row]
        });

        const reply = <Message> await interaction.fetchReply();

        const collector = new InteractionCollector(client, {
            channel: reply.channel,
            message: reply,
            componentType: ComponentType.Button,
            interactionType: InteractionType.MessageComponent,
            filter(i) {
                return i.isButton() && i.customId.startsWith('restart');
            },
            time: 15000
        });

        collector.on('collect', async i => {
            if (!i.isButton())
                return;
            
            if (i.member!.user.id !== interaction.member!.user.id) {
                await i.reply({
                    content: 'That\'s not your button.',
                    ephemeral: true
                });

                return;
            }

            if (i.customId === 'restart:true') {
                await i.update({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('#007bff')
                        .setTitle('System Restart')
                        .setDescription('Restarting. The system will be online soon.')
                    ],
                    components: [disabledRow]
                });                

                await process.exit(0);
            }
            else {
                await i.update({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(Colors.Grey)
                        .setTitle('System Restart')
                        .setDescription('This action has been canceled.')
                    ],
                    components: [disabledRow]
                });
            }
        });

        collector.on('end', async i => {
            if (reply.embeds[0].hexColor === '#007bff') {
                await reply.edit({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(Colors.Grey)
                        .setTitle('System Restart')
                        .setDescription('This action has been canceled due to inactivity.')
                    ],
                    components: [disabledRow]
                });
            }
        });
    }
}