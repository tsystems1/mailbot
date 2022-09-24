import { Message, CommandInteraction, CacheType, AttachmentBuilder, User, TextChannel, JSONEncodable, AttachmentPayload, EmbedBuilder, AttachmentData, Attachment, ChatInputCommandInteraction } from "discord.js";
import Client from "../../client/Client";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import Thread, { IThread } from '../../models/Thread';
import { formatSize, getChannel, getGuild, loggingChannel } from "../../utils/util";

export interface ThreadReplyOptions {
    content: string;
    attachments?: Attachment[];
    author: User;
    isAnonymous?: boolean;
}

export async function replyToThread(client: Client, thread: IThread, { content, attachments = [], author, isAnonymous = false }: ThreadReplyOptions) {
    const channel = getChannel(client, thread!.channel) as TextChannel;

    try {
        const user = await (getGuild(client)?.members.fetch(thread.user));

        if (!user) {
            return;
        }
        
        const media: EmbedBuilder[] = [];
        const files: Attachment[] = [];

        for await (let a of attachments) {
            if (/^(image)\//.test(a.contentType ?? '')) {
                media.push(
                    new EmbedBuilder()
                    .setTitle(a.name ?? 'Attachment')
                    .setImage(a.proxyURL)
                    .setColor(0x007bff)
                    .setFooter({
                        text: formatSize(a.size)
                    })
                    .setTimestamp()
                );
            }
            else {
                files.push(a);
            }
        }

        let message: Message;

        try {
            message = await user!.send({
                embeds: [
                    new EmbedBuilder({
                        author: {
                            name: isAnonymous ? 'Staff' : author.tag,
                            iconURL: isAnonymous ? client.user!.displayAvatarURL() : author.displayAvatarURL()
                        },
                        description: (content ?? '').trim() === '' ? '*No content*' : content,
                        footer: { text: `Received`, iconURL: getGuild(client)!.iconURL() ?? undefined },
                        color: 0x007bff
                    })
                    .setTimestamp(),
                    ...media
                ],
            });

            if (files.length > 0) {
                await user.send({ files });
            }
        }
        catch (e) {
            console.log(e);
            return null;
        }

        const embed = new EmbedBuilder({
            author: {
                name: author.tag,
                iconURL: author.displayAvatarURL()
            },
            description: (content ?? '').trim() === '' ? '*No content*' : content,
            footer: { text: `${isAnonymous ? 'Anonymous' : 'Normal'} Reply • ${message.id}` },
            color: 0x007bff
        }).setTimestamp();


        if (channel) {
            await channel.send({
                embeds: [
                    embed,
                    ...media
                ]
            });

            if (files.length > 0) {
                await channel.send("Other files are also sent.");
            }
        }

        await (loggingChannel(client).send({
            embeds: [
                new EmbedBuilder({
                    author: author ? {
                        name: author.tag,
                        iconURL: author.displayAvatarURL()
                    } : undefined,
                    description: 'A new message was sent by **' + author.tag + '**.',
                    fields: [
                        {
                            name: 'Thread ID',
                            value: thread.id
                        },
                        {
                            name: 'Channel ID',
                            value: thread.channel
                        },
                        {
                            name: 'Sent to',
                            value: user!.user.tag + ` (${user!.user.id})`
                        },
                    ],
                    footer: {
                        text: `Sent`
                    },
                    color: 0x007bff
                })
                .setTimestamp(),
                embed,
                ...media
            ]
        }));

        if (files.length > 0) {
            await (loggingChannel(client)).send({ files });
        }

        return { channel, message, member: user };
    }
    catch (e) {
        console.log(e);     
    }
}

export default class ReplyCommand extends BaseCommand {
    public mailOnly: boolean = true;

    constructor() {
        super('reply', 'mailing', ['rt', 'r', 'rta', 'a', 'ra']);
    }

    async run(client: Client, message: Message<boolean> | ChatInputCommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        let content = '', isAnonymous = false;

        if (options) {
            content = options.rawArgs.join(' ');
            isAnonymous = ['rta', 'ra', 'a'].includes(options.rawArgv[0]) ? true : isAnonymous;
        }
        else if (message instanceof CommandInteraction) {
            content = message.options.getString('message')!;
            isAnonymous = message.options.getBoolean('anonymous')!;
            await message.deferReply({ ephemeral: true });
        }

        const thread = await Thread.findOne({ channel: message.channel!.id });

        if (!thread) {
            await this.deferedReply(message, {
                content: ':x: This thread is already closed or deleted.'
            });

            return;
        }

        try {
            const data = await replyToThread(client, thread, {
                content,
                author: message.member!.user as User,
                isAnonymous,
                attachments: message instanceof Message ? message.attachments.toJSON() : (message.options.getAttachment('attachment') ? [message.options.getAttachment('attachment')!] : [])
            });

            if (data === undefined) {
                await this.deferedReply(message, { content: ":x: The user left the server or has deleted their account. (Failed to communicate)", ephemeral: true });
                return;
            }

            if (data === null) {
                await this.deferedReply(message, { content: ":x: The user has disabled DMs. (Failed to deliver DM)", ephemeral: true });
                return;
            }
        }
        catch (e) {
            console.log(e);            
        }

        if (message instanceof ChatInputCommandInteraction && !message.replied) {
            await this.deferedReply(message, { content: 'Your message has been sent.', ephemeral: true });
        }
    }
}