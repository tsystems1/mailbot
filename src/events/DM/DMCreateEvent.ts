import BaseEvent from '../../utils/structures/BaseEvent';
import { CategoryChannelResolvable, Message, TextBasedChannel } from 'discord.js';
import DiscordClient from '../../client/Client';
import MessageEmbed from '../../utils/MessageEmbed';
import Thread from '../../models/Thread';
import { getChannel } from '../../utils/utils';

export default class DMCreateEvent extends BaseEvent {
    constructor() {
        super('DMCreate');
    }

    async run(client: DiscordClient, message: Message) {       
        const { author } = message;
        const thread = await Thread.findOne({ user: author.id });

        if (thread) {
            const channel = await getChannel(client, thread.channel);
            
        }
    }
}



