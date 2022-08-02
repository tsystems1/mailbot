import { GuildChannel, Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import MessageEmbed from '../../utils/MessageEmbed';
import ms from 'ms';

export default class CloseCommand extends BaseCommand {
    constructor() {
        super('close', 'mails', ['c', 'ct']);
        this.optionParse = true;
    }

    async run(client: DiscordClient, message: Message, args: Array<string>, options: Array<string>, normalArgs: Array<string>) {
        
    }
}