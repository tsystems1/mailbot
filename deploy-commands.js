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

const { REST, Routes, SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { config } = require('dotenv');

config();

const rest = new REST({
    version: '10'
}).setToken(process.env.TOKEN);

const slashCommands = [
    new SlashCommandBuilder()
        .setName('close')
        .setDescription('Closes a mail thread')
        .setDMPermission(false)
        .addStringOption(opt => opt.setName('close_in').setDescription('Set the closing timeout for this thread'))
        .addStringOption(opt => opt.setName('reason').setDescription('The reason for closing this thread'))
        .addBooleanOption(opt => opt.setName('delete').setDescription('Delete the thread channel (default is: false)')),
    new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a mail thread channel (also closes if not closed)')
        .setDMPermission(false)
        .addStringOption(opt => opt.setName('reason').setDescription('The reason for deleting this thread'))
        .addBooleanOption(opt => opt.setName('silent').setDescription('Close silently without DMing the user')),
    new SlashCommandBuilder()
        .setName('block')
        .setDescription('Block a member from using MailBot')
        .setDMPermission(false)
        .addUserOption(opt => opt.setName('user').setDescription('The user to be blocked').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('The reason for blocking this user'))
        .addBooleanOption(opt => opt.setName('notify').setDescription('Notify the user about this block')),
    new SlashCommandBuilder()
        .setName('unblock')
        .setDescription('Unblock a member')
        .setDMPermission(false)
        .addUserOption(opt => opt.setName('user').setDescription('The user to be unblocked').setRequired(true))
        .addStringOption(opt => opt.setName('reason').setDescription('The reason for unblocking this user'))
        .addBooleanOption(opt => opt.setName('notify').setDescription('Notify the user about this unblock')),
    new SlashCommandBuilder()
        .setName('reply')
        .setDescription('Replies to a mail thread (DMs the thread author)')
        .setDMPermission(false)
        .addStringOption(opt => opt.setName('message').setDescription('The message to send'))
        .addBooleanOption(opt => opt.setName('anonymous').setDescription('Anonymous reply (Defaults to false)'))
        .addAttachmentOption(opt => opt.setName('attachment').setDescription('Attachment to send')),
    new SlashCommandBuilder()
        .setName('edit')
        .setDescription('Edit a message sent by MailBot')
        .setDMPermission(false)
        .addStringOption(opt => opt.setName('message').setDescription('The ID of the message to edit').setRequired(true))
        .addStringOption(opt => opt.setName('content').setDescription('The new content of the message').setRequired(true)),
    new SlashCommandBuilder()
        .setName('delmsg')
        .setDescription('Delete a message sent by MailBot')
        .setDMPermission(false)
        .addStringOption(opt => opt.setName('message').setDescription('The ID of the message to delete').setRequired(true))
];

const contextMenuCommands = [
    new ContextMenuCommandBuilder()
        .setName("Edit Thread Message")
        .setDMPermission(false)
        .setType(ApplicationCommandType.Message),
    new ContextMenuCommandBuilder()
        .setName("Delete Thread Message")
        .setDMPermission(false)
        .setType(ApplicationCommandType.Message)
];

const commands = [...slashCommands, ...contextMenuCommands].map(cmd => cmd.toJSON());

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
    .then(() => console.log('Successfully registered application guild commands.'))
    .catch(console.error);