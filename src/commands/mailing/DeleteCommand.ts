import { ChatInputCommandInteraction, CommandInteraction, Embed, EmbedBuilder, GuildChannel, Message, User } from 'discord.js';
import BaseCommand from '../../utils/structures/BaseCommand';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';
import Thread from '../../models/Thread';
import { getChannel, getGuild, loggingChannel } from '../../utils/util';
import { closeThread } from './CloseCommand';

export default class DeleteCommand extends BaseCommand {
    mailOnly = true;
    requireModRole = true;

    constructor() {
        super('delete', 'mailing', ['dt']);
    }

    async run(client: DiscordClient, message: Message | CommandInteraction, options?: CommandOptions) {
        let reason: string | null = null;

        if (message instanceof CommandInteraction && message.isChatInputCommand()) {
            reason = message.options.getString('reason');
            await message.deferReply();
        }
        else if (options) {
            reason = options.rawArgs.filter(a => a[0] !== '-').join(' ');
        }

        const { channel } = message;

        await closeThread(client, message.channel!.id, message.member!.user as User, true, true, reason);

        try {
            if ((channel as GuildChannel).parent?.id !== client.config.mail_category)
                return;

            await loggingChannel(client).send({
                embeds: [
                    new EmbedBuilder({
                        color: 0x007bff,
                        description: 'A thread channel was deleted.',
                        fields: [
                            {
                                name: 'Channel ID',
                                value: channel!.id + ''
                            },
                            {
                                name: 'Deleted by',
                                value: (message.member?.user as User).tag + ` (${(message.member?.user as User).id})`
                            },
                        ],
                        footer: {
                            text: 'Deleted'
                        }
                    })
                    .setTimestamp()
                ]
            });

            await message.channel?.delete();
        }
        catch (e) {
            console.log(e);

            this.deferedReply(message, {
                embeds: [
                    {
                        description: ':x: Cannot delete this channel, probably not a mailbot thread or missing permissions?',
                        color: 0xf14a60
                    }
                ]
            }).catch(console.error);
        }
    }
}