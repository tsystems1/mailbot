import { GuildChannel, Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import MessageEmbed from '../../utils/MessageEmbed';
import ms from 'ms';

export default class CloseAllCommand extends BaseCommand {
    constructor() {
        super('closeall', 'mails', ['ca', 'cta']);
        this.optionParse = true;
    }

    async run(client: DiscordClient, message: Message) {
        
    }
}