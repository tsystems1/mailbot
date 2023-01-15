import { Message, CommandInteraction, CacheType, ChatInputCommandInteraction, EmbedBuilder, Utils, escapeMarkdown, GuildMember, User, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import Client from "../../client/Client";
import { createThread } from "../../events/dm/DMCreateEvent";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { getGlobalUser, getUser } from "../../utils/utils";
import { replyToThread } from './ReplyCommand';

export default class CreateThreadCommand extends BaseCommand {
    requireModRole = true;
    
    constructor() {
        super('createthread', 'mailing', ['thread', 'newthread', 'create', 'cthread', 'cthr']);
    }

    async run(client: Client, message: Message<boolean> | ChatInputCommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        if (options && options.args[0] === undefined) {
            await message.reply(":x: You must specify a user.");
            return;
        }

        const user = message instanceof ChatInputCommandInteraction ? message.options.getUser('user', true) as User : (await getGlobalUser(options!.args[0]));

        if (!user) {
            await message.reply(`:x: That user could not be found.`);
            return;
        }

        const content = message instanceof ChatInputCommandInteraction ? message.options.getString('initial_message') : (
            options!.args.length < 2 ? undefined : message.content.slice(client.prefix.length).trim().slice(options!.rawArgv[0].length).trim().slice(options!.args[0].length).trim()
        );

        if (message instanceof ChatInputCommandInteraction)
            await message.deferReply();

        const { channel, thread } = await createThread(client, null, user, message.member!.user as User);

        if (content) {
            await replyToThread(client, thread, {
                author: message.member!.user as User,
                content,
                attachments: message instanceof Message ? message.attachments.toJSON() : undefined,
                isAnonymous: message instanceof ChatInputCommandInteraction ? message.options.getBoolean('anonymous') ?? true : true
            });
        }

        await this.deferedReply(message, {
            embeds: [
                new EmbedBuilder({
                    author: {
                        iconURL: user.displayAvatarURL(),
                        name: user.tag
                    },
                    color: 0x007bff,
                    description: `A thread channel ${channel!.toString()} has been created${content ? ' with the given initial message' : ''}.`,
                    fields: [
                        {
                            name: 'Thread ID',
                            value: thread.id,
                        },
                        {
                            name: 'User ID',
                            value: user.id
                        },
                    ],
                    footer: {
                        text: `Created`
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