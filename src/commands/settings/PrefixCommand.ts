import { Message, MessageEmbed } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';

export default class PrefixCommand extends BaseCommand {
    constructor() {
        super('prefix', 'settings', []);
    }

    async run(client: DiscordClient, message: Message, args: Array<string>) {    
        if (args[0] === undefined) {
            await message.reply({
                embeds: [
                    new MessageEmbed()
                    .setColor('#f14a60')
                    .setDescription('This command requires at least one argument.')
                ]
            });

            return;
        }

        await client.config.set("prefix", args[0]);
        await client.config.write();

        await message.channel.send({
            embeds: [
                new MessageEmbed()
                .setColor('#007bff')
                .setDescription('The system has updated the prefix `(' + args[0] + ')`.')
            ]
        });
    }
}