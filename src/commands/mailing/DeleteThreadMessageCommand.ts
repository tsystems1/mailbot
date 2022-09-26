import { Message, CommandInteraction, CacheType, User, EmbedBuilder, ChatInputCommandInteraction, TextChannel, MessageContextMenuCommandInteraction, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Attachment } from "discord.js";
import DiscordClient from "../../client/Client";
import Client from "../../client/Client";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import StaffMessage from '../../models/StaffMessage';
import { formatSize, getChannel, getGuild, loggingChannel } from "../../utils/utils";
import Thread, { IThread } from "../../models/Thread";

export async function deleteThreadMessage(client: DiscordClient, thread: IThread, id: string, author: User) {
    const channel = getChannel(client, thread!.channel) as TextChannel;

    const staffMessage = await StaffMessage.findOne({ threadMessageID: id });
    let message: Message | undefined;
    let embed: EmbedBuilder | undefined;

    if (!staffMessage) {
        return false;
    }

    if (staffMessage.authorID !== author.id) {
        return 101;
    }

    try {
        const user = await (getGuild(client)?.members.fetch(thread.user));

        if (!user) {
            return;
        }

        try {
            let fileMessage: Message | undefined;

            if (!user.dmChannel) {
                console.log('Reloading DM channel...');

                try {
                    await user.createDM(true);
                }
                catch (e) {
                    console.log(e);
                }
            }

            message = await user.dmChannel!.messages.fetch(staffMessage!.dmID);

            console.log(message);

            if (!message) {
                return false;
            }

            embed = new EmbedBuilder({
                author: {
                    name: message.embeds[0].author?.name === 'Staff' ? 'Staff' : author.tag,
                    iconURL: message.embeds[0].author?.name === 'Staff' ? client.user?.displayAvatarURL() : author.displayAvatarURL(),
                },
                description: message.embeds[0].description ?? "*No content*",
                color: 0xf14a60,
                footer: { text: (message.embeds[0].author?.name === 'Staff' ? 'Anonymous' : 'Normal') + ' Reply (Deleted)' },
                fields: [
                    {
                        name: 'Original Message',
                        value: `[Jump](https://discord.com/channels/${getGuild(client)!.id}/${channel.id}/${id})`
                    }
                ]
            }).setTimestamp();

            if (channel) {
                await channel.send({
                    embeds: [embed]
                });
            }

            const { embeds } = message;

            embeds.shift();

            if (staffMessage!.fileMessage) {
                try {
                    fileMessage = await user.dmChannel!.messages.fetch(staffMessage!.fileMessage);

                    if (!fileMessage || !fileMessage.attachments?.size) {
                        fileMessage = undefined;
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }

            await (loggingChannel(client).send({
                embeds: [
                    new EmbedBuilder({
                        author: author ? {
                            name: author.tag,
                            iconURL: author.displayAvatarURL()
                        } : undefined,
                        title: 'Reply Deleted',
                        description: 'A message was deleted by **' + author.tag + '**.',
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
                                name: 'DM ID',
                                value: staffMessage.dmID
                            },
                            {
                                name: 'Thread Message ID',
                                value: id
                            },
                            {
                                name: 'Was previously sent to',
                                value: user!.user.tag + ` (${user!.user.id})`
                            },
                        ],
                        footer: {
                            text: `Deleted`
                        },
                        color: 0x007bff
                    })
                    .setTimestamp(),
                    embed,
                    ...embeds
                ]
            }));

            if (fileMessage) {
                await (loggingChannel(client).send({
                    files: fileMessage.attachments.toJSON()
                }));
            }

            await message.delete();
            await fileMessage?.delete();

            await staffMessage.delete();
        }
        catch (e) {
            console.log(e);
            return false;        
        }
    }
    catch (e) {
        console.log(e);
        return null;        
    }

    return { message, embed };
}

export default class DeleteThreadMessageCommand extends BaseCommand {
    public messageContextMenu: boolean = true;
    
    constructor() {
        super('delete-thread-message', 'mailing', ['delmsg', 'd', 'dlm', "Delete Thread Message"])
    }

    async run(client: DiscordClient, message: Message<boolean> | CommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        if (options && options.args[0] === undefined) {
            await message.reply({
                embeds: [
                    {
                        description: ':x: You must specify a message ID to delete.',
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }

        let id = '';

        if (message instanceof CommandInteraction) {
            await message.deferReply({ ephemeral: true });
        }

        if (options) {
            id = options.args[0];
        }
        else if (message instanceof ChatInputCommandInteraction) {
            id = message.options.getString('message')!;
        }        
        else if (message instanceof MessageContextMenuCommandInteraction) {
            id = message.targetMessage.id;
        }        

        const main = async () => {
            const thread = await Thread.findOne({ channel: message.channel!.id });

            if (!thread) {
                await this.deferedReply(message, {
                    content: ':x: This thread is already closed or deleted.'
                });

                return;
            }

            const result = await deleteThreadMessage(client, thread, id, message.member!.user as User);

            if (result === false) {
                this.deferedReply(message, ":x: The given message does not exist.");
            }
            else if (result === 101) {
                this.deferedReply(message, ":x: You can only delete messages sent by you!");
            }
            else if (message instanceof ChatInputCommandInteraction) {
                this.deferedReply(message, "Message deleted successfully.");
            }
        };

        if (message instanceof MessageContextMenuCommandInteraction) {
            if (message.targetMessage.author.id !== client.user?.id) {
                await message.editReply({ content: ":x: You can only perform this operation on a MailBot message!" });
                return;
            }

            const staffMessage = await StaffMessage.findOne({ threadMessageID: id });

            if (!staffMessage) {
                await message.editReply({ content: ":x: Message not available." });
                return;
            }

            if (staffMessage.authorID !== message.member?.user.id) {
                await message.editReply({ content: ":x: You can only delete messages sent by you!" });
                return;
            }
            
            const actionButtonPrefix = `btn_${Math.round(Math.random() * 10000)}_`;

            await message.editReply({
                embeds: [
                    new EmbedBuilder({
                        title: 'Confirm Deletion',
                        description: 'Are you sure to delete this message? This can not be undone.',
                        color: 0x007bff,
                    })
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(
                            new ButtonBuilder()
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Danger)
                                .setCustomId(`${actionButtonPrefix}no`),
                            new ButtonBuilder()
                                .setLabel('Delete')
                                .setStyle(ButtonStyle.Success)
                                .setCustomId(`${actionButtonPrefix}yes`)
                        )
                ]
            });

            message.channel?.awaitMessageComponent({
                componentType: ComponentType.Button,
                dispose: true,
                time: 60_000,   
                filter: i => i.customId.startsWith(actionButtonPrefix) && i.member?.user.id === message.member?.user.id
            })
            .then(async interaction => {
                if (interaction.customId !== `${actionButtonPrefix}yes`) {
                    await interaction.reply({ content: 'Operation cancelled.', ephemeral: true });
                    return;
                }

                await main();
                await interaction.reply({ content: 'Message deleted successfully!', ephemeral: true });
            })
            .finally(async () => {
                const reply = await message.fetchReply();
                await message.editReply({
                    content: reply.content, 
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setLabel('Cancel')
                                    .setStyle(ButtonStyle.Danger)
                                    .setDisabled(true)
                                    .setCustomId(Math.random() + "abc"),
                                new ButtonBuilder()
                                    .setLabel('Delete')
                                    .setStyle(ButtonStyle.Success)
                                    .setDisabled(true)
                                    .setCustomId(Math.random() + "abc")
                            )
                    ]
                });
            })
            .catch(err => {
                console.log(err);
                message.followUp({ content: 'Operation cancelled due to inactivity.', ephemeral: true });
            });

            return;
        }

        await main();
    }
}