import BaseEvent from '../../utils/structures/BaseEvent';
import { ChannelType, Message } from 'discord.js';
import DiscordClient from '../../client/Client';

export default class MessageCreateEvent extends BaseEvent {
    constructor() {
        super('messageCreate');
    }

    async run(client: DiscordClient, message: Message) {
        if (message.author.bot) 
            return;

        if (message.channel.type === ChannelType.DM || !message.guild) {
            client.emit('dmCreate', message);
            return;
        }
        
        if (message.content.startsWith(client.config.prefix)) {
            const [cmdName, ...cmdArgs] = message.content
                .slice(client.prefix.length)
                .trim()
                .split(/\s+/);

            const command = client.commands.get(cmdName);
            
            if (command) {
                command.run(client, message, cmdArgs);
            }
        }
    }
}