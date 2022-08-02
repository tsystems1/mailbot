import { Attachment, AttachmentBuilder, EmbedBuilder, Message, TextChannel, User } from "discord.js";
import DiscordClient from "../../client/Client";
import Client from "../../client/Client";
import Thread from "../../models/Thread";
import BaseEvent from "../../utils/structures/BaseEvent";
import { formatSize, getChannel, mailCategory } from "../../utils/util";

export async function createThread(client: DiscordClient, name: string, createdBy: User) {
    const parent = await mailCategory(client);
    const channel = await client.guilds.cache.get(process.env.GUILD_ID!)?.channels.create({
        name,
        parent,
    });

    const thread = await Thread.create({
        user: createdBy.id,
        channel: channel!.id,
        createdBy: createdBy.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    return { channel, thread };
}

export default class DMCreateEvent extends BaseEvent {
    constructor() {
        super('dmCreate');
    }

    async run(client: Client, message: Message) {
        let thread = await Thread.findOne({ user: message.author.id });
        let channel: TextChannel;
        
        if (!thread) {
            const { channel: newChannel, thread: newThread } = await createThread(client, message.author.tag.replace('#', '-'), message.author);
            thread = newThread!;
            channel = newChannel!;

            await channel.send({
                embeds: [
                    new EmbedBuilder({
                        author: {
                            name: message.author.tag,
                            iconURL: message.author.displayAvatarURL(),
                        },
                        thumbnail: {
                            url: message.author.displayAvatarURL(),
                        },
                        description: `${message.author} created a new thread conversation. You can reply to it below using \`r\` or \`a\` command.`,
                        footer: {
                            text: `Created`
                        },
                        color: 0x007bff
                    })
                    .setTimestamp()
                ]
            });
        }
        else {
            channel = <TextChannel> await getChannel(client, thread.channel);
        }

        const media: EmbedBuilder[] = [];
        const files: Attachment[] = [];

        for await (let a of message.attachments.values()) {
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

        await channel.send({
            embeds: [
                new EmbedBuilder({
                    author: {
                        name: message.author.tag,
                        iconURL: message.author.displayAvatarURL(),
                    },
                    color: 0x007bff,
                    description: message.content,
                    footer: {
                        text: `Received`
                    },
                })
                .setTimestamp(),
                ...media
            ],
        });

        if (files.length > 0) {
            await channel.send({
                files
            });
        }
    }
}