import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import ms from 'ms';

export default class StopTypingCommand extends BaseCommand {
    constructor() {
        super('stoptyping', 'settings', ['stoptype', 'typestop']);
    }

    async run(client: DiscordClient, message: Message, options: CommandOptions) {
        if (client.typingInterval)
            clearInterval(client.typingInterval);

        if (client.typingTimeOut)
            clearTimeout(client.typingTimeOut);

        message.reply(`Stopped typing.`).catch(console.error);
    }
}