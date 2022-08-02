import {CategoryChannelResolvable, GuildChannel, GuildMember, Message, TextChannel, User} from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import MessageEmbed from "../../utils/MessageEmbed";

export default class NewThreadCommand extends BaseCommand {
    constructor() {
        super('newthread', 'mails', ['new', 'nt']);
    }

    async run(client: DiscordClient, message: Message, args: Array<string>) {
        
    }
}