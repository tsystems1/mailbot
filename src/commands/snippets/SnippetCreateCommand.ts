import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import DiscordClient from "../../client/Client";
import Snippet from "../../models/Snippet";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";

export default class SnippetCreateCommand extends BaseCommand {
    name = "snippet__create";
    category = "snippets";
    aliases = [];

    async run(client: DiscordClient, message: Message | ChatInputCommandInteraction, options?: CommandOptions) {
        if (options && options.args[0] === undefined) {
            await message.reply(":x: You must specify a snippet name.");
            return;
        }

        if (options && options.args[1] === undefined) {
            await message.reply(":x: You must specify the snippet message content.");
            return;
        }

        if (message instanceof ChatInputCommandInteraction) {
            await message.deferReply();
        }

        const name = message instanceof Message ? options!.args.shift()! : message.options.getString('name', true);
        const content = message instanceof Message ? message.content.slice(client.config.prefix.length).trim().slice(options!.commandName.length).trim().slice("create".length).trim().slice(name.length).trim() : message.options.getString('content', true);
        const anonymous = message instanceof ChatInputCommandInteraction ? message.options.getBoolean('anonymous') ?? true : true;

        await Snippet.create({
            name,
            content,
            anonymous
        });

        await this.deferedReply(message, {
            embeds: [
                new EmbedBuilder({
                    author: {
                        name,
                        iconURL: client.user!.displayAvatarURL()
                    },
                    description: content,
                    footer: {
                        text: `Snippet Created • Preview • ${anonymous ? 'Anonymous' : 'Normal'}`
                    },
                    color: 0x007bff
                })
                .setTimestamp()
            ]
        });
    }
}
