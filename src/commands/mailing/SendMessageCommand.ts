import { Message, CommandInteraction, CacheType, ChatInputCommandInteraction, EmbedBuilder, Utils, escapeMarkdown, GuildMember, User, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Client from "../../client/Client";
import { createThread } from "../../events/dm/DMCreateEvent";
import Thread from "../../models/Thread";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { getGlobalUser, getUser } from "../../utils/utils";
import { replyToThread } from './ReplyCommand';

export default class SendMessageCommand extends BaseCommand {
    requireModRole = true;
    
    constructor() {
        super('send', 'mailing', ['sendmessage', 'sendmsg', 's', 'sa', 'sr']);
    }

    async run(client: Client, message: Message<boolean> | ChatInputCommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        if (options && options.args[1] === undefined) {
            await message.reply(":x: You must specify a user and the message content.");
            return;
        }

        const user = message instanceof ChatInputCommandInteraction ? message.options.getUser('user', true) as User : (await getGlobalUser(options!.args[0]));

        if (!user) {
            await message.reply(`:x: That user could not be found or is not a member of this server.`);
            return;
        }

        const content = message instanceof ChatInputCommandInteraction ? message.options.getString('message', true) : (
            message.content.slice(client.prefix.length).trim().slice(options!.rawArgv[0].length).trim().slice(options!.args[0].length).trim()
        );

        if (message instanceof ChatInputCommandInteraction)
            await message.deferReply();

        let thread = await Thread.findOne({
            user: user.id,
        });

        if (!thread) {
            const { thread: newThread } = await createThread(client, null, user, message.member!.user as User);
            thread = newThread;
        }

        const { channel, message: reply } = (await replyToThread(client, thread, {
            author: message.member!.user as User,
            content,
            attachments: message instanceof Message ? message.attachments.toJSON() : undefined,
            isAnonymous: message instanceof ChatInputCommandInteraction ? message.options.getBoolean('anonymous') ?? true : (
                options!.commandName !== 's' && options!.commandName !== 'sr'
            )
        }))!;

        await this.deferedReply(message, {
            embeds: [
                new EmbedBuilder({
                    author: {
                        iconURL: user.displayAvatarURL(),
                        name: user.tag
                    },
                    color: 0x007bff,
                    description: `The message was sent.`,
                    fields: [
                        {
                            name: 'Thread ID',
                            value: thread.id,
                        },
                        {
                            name: 'Message ID',
                            value: `${reply.id}`
                        },
                        {
                            name: 'User ID',
                            value: user.id
                        },
                    ],
                    footer: {
                        text: `Sent`
                    }
                })
                .setTimestamp()
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel('Go to Thread')
                            .setURL(channel!.url)
                    )
            ]
        });
    }
}