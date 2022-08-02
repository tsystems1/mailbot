import { registerCommands, registerEvents } from './utils/registry';
import DiscordClient from './client/Client';
import { Intents } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
    config();
}

const client = new DiscordClient({
    partials: ["CHANNEL"],
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGES, 
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ]
});

(async () => {
    client.prefix = process.env.PREFIX || client.prefix;

    await registerCommands(client, '../commands');
    await registerEvents(client, '../events');

    await client.login(process.env.TOKEN);
})();