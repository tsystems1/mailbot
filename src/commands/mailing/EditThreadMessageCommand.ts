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

import { Client, Message, ChatInputCommandInteraction, CacheType, MessageContextMenuCommandInteraction, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, User, ComponentType, Embed, EmbedBuilder } from "discord.js";
import DiscordClient from "../../client/Client";
import StaffMessage from "../../models/StaffMessage";
import Thread from "../../models/Thread";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { getGuild } from "../../utils/utils";
import { updateReply } from "./EditCommand";

export default class EditThreadMessageCommand extends BaseCommand {   
    public mailOnly: boolean = true;
    public messageContextMenu: boolean = true;
    public legacy: boolean = false;
    requireModRole = true;

    constructor() {
        super('Edit Thread Message', 'mailing', []);
    }

    async run(client: DiscordClient, interaction: MessageContextMenuCommandInteraction<CacheType>): Promise<void> {
        const thread = await Thread.findOne({ channel: interaction.channel!.id });

        if (!thread) {
            await interaction.reply({
                content: 'This thread is already closed or deleted.',
                ephemeral: true
            });

            return;
        }

        const { id, author } = interaction.targetMessage;
        
        if (author.id !== client.user?.id) {
            await interaction.reply({
                content: 'You must attempt to edit a message sent by the bot!',
                ephemeral: true
            });

            return;
        }
        
        try {
            const user = await client.users.fetch(thread.user);

            if (!user) {
                throw new Error();
            }
            
            const staffMessage = await StaffMessage.findOne({ threadMessageID: id });

            if (!staffMessage) {
                throw new Error();
            }

            if (staffMessage.authorID !== interaction.member?.user.id) {
                await interaction.reply({
                    content: 'You can only edit messages sent by you!',
                    ephemeral: true
                });
    
                return;
            }

            if (!user.dmChannel) {
                console.log('Reloading DM channel...');

                try {
                    await user.createDM(true);
                }
                catch (e) {
                    console.log(e);
                }
            }

            const message = await user.dmChannel!.messages.fetch(staffMessage!.dmID);

            console.log(message);

            if (!message) {
                throw new Error();
            }

            const modal = new ModalBuilder()
                .setCustomId(`message_edit_modal__${message.id}_${interaction.channel!.id}`)
                .setTitle("Edit Thread Message")
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(
                            new TextInputBuilder()
                                .setCustomId('content')
                                .setLabel('Updated Content')
                                .setRequired(true)
                                .setStyle(TextInputStyle.Paragraph)
                                .setValue(message.embeds[0].description ?? ''),
                        )
                );

            await interaction.showModal(modal);
            
            interaction.awaitModalSubmit({
                time: 10 * 60 * 1000,
                dispose: true,
                filter(i) {
                    return i.member?.user.id === interaction.member?.user.id && i.channel?.id === interaction.channel?.id && i.customId === `message_edit_modal__${message.id}_${interaction.channel!.id}`;
                }
            })
            .then(async interaction => {
                try {
                    const result = await updateReply(client, thread, id, {
                        content: interaction.fields.getTextInputValue('content'),
                        author: interaction.member!.user as User
                    });

                    if (!result) {
                        throw new Error();
                    }

                    await interaction.reply({
                        content: "Message updated successfully!",
                        ephemeral: true
                    });
                }
                catch (e) {
                    console.log(e);
                    await interaction.reply({
                        content: "Error occurred while trying to update the message.",
                        ephemeral: true
                    });
                }
            })
            .catch(console.error)
        }
        catch (e) {
            await interaction.reply({
                content: "Message not available. Make sure you're performing this operation on a sent message, not edited message!",
                ephemeral: true
            });

            return;
        }
    }
}