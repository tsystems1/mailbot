import { ChatInputCommandInteraction, EmbedBuilder, Message, User } from "discord.js";
import DiscordClient from "../../client/Client";
import Snippet from "../../models/Snippet";
import Thread from "../../models/Thread";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { replyToThread } from "../mailing/ReplyCommand";

export default class SnippetUseCommand extends BaseCommand {
    name = "snippet__use";
    category = "snippets";
    aliases = ['su', 'use'];
    mailOnly = true;

    async run(client: DiscordClient, message: Message | ChatInputCommandInteraction, options?: CommandOptions) {
        if (options && options.args[0] === undefined) {
            await message.reply(":x: You must specify a snippet name.");
            return;
        }

        const name = message instanceof Message ? options!.args.shift()! : message.options.getString('name', true);
        const snippet = await Snippet.findOne({
            name
        });

        if (!snippet) {
            await message.reply(":x: No snippet found with that name.");
            return;
        }

        const thread = await Thread.findOne({ channel: message.channel!.id });

        if (!thread) {
            await message.reply(":x: This thread was closed already or not a thread channel.");
            return;
        }

        const result = await replyToThread(client, thread, {
            content: snippet.content,
            author: message.member!.user as User,
            isAnonymous: snippet.anonymous
        });

        if (!result) {
            await message.reply(":x: Failed to deliver the message.");
            return;
        }
    }
}