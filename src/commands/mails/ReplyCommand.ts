import { GuildChannel, Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';

export default class ReplyCommand extends BaseCommand {
    constructor() {
        super('reply', 'mails', ['r', 'rt']);
    }

    async run(client: DiscordClient, message: Message, args: Array<string>) {
        
    }
}