import { GuildChannel, Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';

export default class AnonReplyCommand extends BaseCommand {
    constructor() {
        super('anonreply', 'mails', ['a', 'ra', 'rta']);
    }

    async run(client: DiscordClient, message: Message, args: Array<string>) {
        
    }
}