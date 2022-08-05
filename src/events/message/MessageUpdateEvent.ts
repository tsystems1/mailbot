import BaseEvent from '../../utils/structures/BaseEvent';
import { ChannelType, Message } from 'discord.js';
import DiscordClient from '../../client/Client';

export default class MessageUpdateEvent extends BaseEvent {
    constructor() {
        super('messageUpdate');
    }

    async run(client: DiscordClient, oldMessage: Message, newMessage: Message) {
        if (newMessage.author.bot) 
            return;

        if (newMessage.channel.type === ChannelType.DM || !newMessage.guild) {
            client.emit('dmUpdate', oldMessage, newMessage);
        }
    }
}