import BaseEvent from '../../utils/structures/BaseEvent';
import { CategoryChannelResolvable, Message, TextBasedChannel } from 'discord.js';
import DiscordClient from '../../client/Client';
import MessageEmbed from '../../utils/MessageEmbed';

export default class DMUpdateEvent extends BaseEvent {
    constructor() {
        super('DMUpdate');
    }

    async run(client: DiscordClient, msg: Message, newMsg: Message) {
        
    }
}