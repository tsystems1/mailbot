import BaseEvent from '../../utils/structures/BaseEvent';
import { Message } from 'discord.js';
import DiscordClient from '../../client/Client';

export default class MessageUpdatedEvent extends BaseEvent {
    constructor() {
        super('messageUpdate');
    }

    async run(client: DiscordClient, oldMessage: Message, newMessage: Message) {
        if (newMessage.author.bot) 
            return;

        if (!newMessage.guild || newMessage.channel.type === 'DM') {            
            client.emit('DMUpdate', oldMessage, newMessage);
            return;
        }
    }
}