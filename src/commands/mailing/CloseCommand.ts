import { ChatInputCommandInteraction, CommandInteraction, Embed, EmbedBuilder, Message, User } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import Thread from '../../models/Thread';
import { getChannel, getGuild, loggingChannel } from '../../utils/util';

export async function closeThread(client: DiscordClient, channel: string, closedBy: User, del: boolean = false, dm: boolean = true, reason?: string | null) {
    const thread = await Thread.findOne({ channel });

    if (!thread) {
        return null;
    }

    await thread.delete();

    if (del) {
        try {
            await (await getChannel(client, channel))?.delete(reason ?? undefined);
        }
        catch (e) {
            console.log(e);
        }
    }

    let user = null;

    try {
        user = await client.users.fetch(thread.user);
    }
    catch (e) {
        console.log(e);
    }

    console.log(reason ?? '*No reason provided*');

    await (loggingChannel(client).send({
        embeds: [
            new EmbedBuilder({
                author: user ? {
                    name: user.tag,
                    iconURL: user.displayAvatarURL()
                } : undefined,
                description: 'A thread was closed.',
                fields: [
                    {
                        name: 'User ID',
                        value: thread.user
                    },
                    {
                        name: 'Thread ID',
                        value: thread.id
                    },
                    {
                        name: 'Channel ID',
                        value: thread.channel
                    },
                    {
                        name: 'Closed By',
                        value: closedBy.tag + ` (${closedBy.id})`
                    },
                    {
                        name: 'Reason',
                        value: `${reason ?? '*No reason provided*'}`
                    },
                ],
                footer: {
                    text: `Closed`
                },
                color: 0xf14a60
            })
            .setTimestamp()
        ]
    }));

    try {
        if (dm && user) {
            const member = await getGuild(client)?.members.fetch(user.id);

            if (member) {
                await member.send({
                    embeds: [
                        new EmbedBuilder({
                            author: {
                                name: 'Thread Closed',
                                iconURL: client.user?.displayAvatarURL()
                            },
                            color: 0xf14a60,
                            description: 'Thanks for contacting us using MailBot! If you have any further questions or issues, feel free to DM again!',
                            fields: reason ? [
                                {
                                    name: 'Reason',
                                    value: reason
                                }
                            ] : [],
                            footer: {
                                text: 'Closed',
                                iconURL: getGuild(client)!.iconURL() ?? undefined
                            }
                        })
                        .setTimestamp()
                    ]
                });
            }
        }
    }
    catch (e) {
        console.log(e);
    }

    return thread;
}

export default class CloseCommand extends BaseCommand {
    mailOnly = true;
    requireModRole = true;

    constructor() {
        super('close', 'mailing', ['ct', 'c']);
    }

    async run(client: DiscordClient, message: Message | CommandInteraction, options?: CommandOptions) {
        let reason: string | null = null;

        if (message instanceof CommandInteraction && message.isChatInputCommand()) {
            reason = message.options.getString('reason');
            await message.deferReply();
        }
        else if (options) {
            reason = options.rawArgs.filter(a => a[0] !== '-').join(' ').trim();
            reason = reason === '' ? null : reason;
        }

        const thread = await closeThread(client, message.channel!.id, message.member!.user as User, options?.options['-d'] !== undefined || options?.options['--delete'] !== undefined || ((message instanceof ChatInputCommandInteraction && message.options.getBoolean('delete')) ?? false), true, reason);

        if (!thread) {
            await this.deferedReply(message, {
                embeds: [
                    {
                        description: ':x: This thread is already closed.',
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }

        try {
            await this.deferedReply(message, {
                embeds: [
                    new EmbedBuilder({
                        description: 'The thread has been closed.',
                        color: 0x007bff,
                        fields: reason ? [
                            {
                                name: 'Reason',
                                value: reason
                            }
                        ] : [],
                        footer: {
                            text: thread.id + ''
                        }
                    })
                    .setTimestamp()
                ]
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}