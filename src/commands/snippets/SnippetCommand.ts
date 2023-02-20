import { ChatInputCommandInteraction, Message } from "discord.js";
import DiscordClient from "../../client/Client";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";

export default class SnippetCommand extends BaseCommand {
    name = "snippet";
    category = "snippets";
    aliases = ["snippets"];

    async run(
        client: DiscordClient,
        message: Message | ChatInputCommandInteraction,
        options?: CommandOptions
    ) {
        if (options && options.args[0] === undefined) {
            await message.reply(":x: You must specify a subcommand.");
            return;
        }

        const command = client.commands.get(
            `snippet__${
                message instanceof ChatInputCommandInteraction
                    ? message.options.getSubcommand(true)
                    : options!.args[0]
            }`
        );

        if (!command) {
            await message.reply(":x: Invalid subcommand provided.");
            return;
        }

        options!.args.shift();

        await command.execute(client, message, options);
    }
}
