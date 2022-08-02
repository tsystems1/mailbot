import { registerCommands, registerEvents } from './utils/registry';
import config from '../slappey.json';
import DiscordClient from './client/Client';
import { IntentsBitField, Partials } from 'discord.js';
import { config as loadConfig } from 'dotenv';

loadConfig();

const client = new DiscordClient({ 
    intents: [
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.DirectMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
    ]
});

(async () => {
    client.prefix = config.prefix || client.prefix;
    await registerCommands(client, '../commands');
    await registerEvents(client, '../events');
    await client.login(process.env.TOKEN);
})();

