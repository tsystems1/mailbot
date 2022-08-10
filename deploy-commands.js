const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { config } = require('dotenv');

config();

const rest = new REST({
    version: '10'
}).setToken(process.env.TOKEN);

const slashCommands = [
    new SlashCommandBuilder()
        .setName('close')
        .setDescription('Closes a mail thread')
        .addStringOption(opt => opt.setName('reason').setDescription('The reason for closing this thread'))
        .addBooleanOption(opt => opt.setName('delete').setDescription('Delete the thread channel (default is: false)')),
    new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a mail thread channel (also closes if not closed)')
        .addStringOption(opt => opt.setName('reason').setDescription('The reason for deleting this thread'))
        .addBooleanOption(opt => opt.setName('silent').setDescription('Close silently without DMing the user')),
    new SlashCommandBuilder()
        .setName('reply')
        .setDescription('Replies to a mail thread (DMs the thread author)')
        .addStringOption(opt => opt.setName('message').setDescription('The message to send').setRequired(true))
        .addBooleanOption(opt => opt.setName('anonymous').setDescription('Anonymous reply (Defaults to false)'))
        .addAttachmentOption(opt => opt.setName('attachment').setDescription('Attachment to send'))
];

const contextMenuCommands = [];

const commands = [...slashCommands, ...contextMenuCommands].map(cmd => cmd.toJSON());

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
    .then(() => console.log('Successfully registered application guild commands.'))
    .catch(console.error);