import {GuildMember, Message} from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import MessageEmbed from "../../utils/MessageEmbed";

export default class SendCommand extends BaseCommand {
    constructor() {
        super('send', 'mails', ['s']);
    }

    async run(client: DiscordClient, message: Message, args: Array<string>) {
        
    }
}