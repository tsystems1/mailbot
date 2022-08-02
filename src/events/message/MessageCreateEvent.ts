import BaseEvent from '../../utils/structures/BaseEvent';
import { Message } from 'discord.js';
import DiscordClient from '../../client/Client';

export default class MessageCreateEvent extends BaseEvent {
    constructor() {
        super('messageCreate');
    }

    async run(client: DiscordClient, message: Message) {
        if (message.author.bot) 
            return;

        if (!message.guild || message.channel.type === 'DM') {
            client.emit('DMCreate', message);
            return;
        }

        if (message.content.startsWith(client.config.get('prefix'))) {
            const [cmdName, ...cmdArgs] = await message.content
                .slice(client.prefix.length)
                .trim()
                .split(/ +/);

            const command = await client.commands.get(cmdName);

            if (command) {
                if (command.optionParse) {
                    const options = cmdArgs.filter(a => a[0] === '-');
                    const normalArgs = cmdArgs.filter(a => a[0] !== '-');
                    await command.run(client, message, cmdArgs, options, normalArgs);

                    return;
                }

                await command.run(client, message, cmdArgs);
            }
        }
    }
}