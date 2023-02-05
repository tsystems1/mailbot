
import { Message } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import ms from 'ms';

export default class TypeCommand extends BaseCommand {
    constructor() {
        super('type', 'settings', ['starttyping']);
    }

    async run(client: DiscordClient, message: Message, options: CommandOptions) {
        const duration = options.args[0] ? ms(options.args[0]) : null;

        if (Number.isNaN(duration)) {
            await message.reply(`:x: Not a valid time duration.`);
            return;
        }

        await message.channel.sendTyping().catch(e => {
            console.log(e);

            if (client.typingInterval) {
                clearInterval(client.typingInterval);
            }
        });

        client.typingInterval = setInterval(() => {
            message.channel.sendTyping().catch(e => {
                console.log(e);

                if (client.typingInterval) {
                    clearInterval(client.typingInterval);
                }
            });
        }, 10_000);

        if (duration)
            client.typingTimeOut = setTimeout(() => {
                if (client.typingInterval) {
                    clearInterval(client.typingInterval);
                }
            }, duration);

        message.react('✔').catch(console.error);
    }
}