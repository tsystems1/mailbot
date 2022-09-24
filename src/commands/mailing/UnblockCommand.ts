import { Message, CommandInteraction, CacheType, EmbedBuilder, GuildMember } from "discord.js";
import Client from "../../client/Client";
import BlockedUser from "../../models/BlockedUser";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";
import { getUser } from "../../utils/utils";

export default class UnblockCommand extends BaseCommand {
    constructor() {
        super('unblock', 'mailing', ['unblk']);
    }

    async run(client: Client, message: Message<boolean> | CommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        if (options && options.args[0] === undefined) {
            await message.reply({
                embeds: [
                    {
                        description: ':x: You must specify a user to unblock.',
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }

        let member: GuildMember | undefined;

        if (options) {
            member = await getUser(options.args[0]);
        }
        else if (message instanceof CommandInteraction) {
            member = message.options.getMember('user')! as GuildMember;
        }

        if (!member) {
            await message.reply({
                embeds: [
                    {
                        description: ':x: Invalid member specified.',
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }

        const blockedUser = await BlockedUser.findOne({ discordID: member.id });

        if (!blockedUser) {
            await message.reply({
                embeds: [
                    {
                        description: ':x: This user was never blocked!',
                        color: 0xf14a60
                    }
                ]
            });

            return;
        }

        await blockedUser.delete();

        await message.reply({
            embeds: [
                new EmbedBuilder({
                    author: {
                        name: member.user.tag,
                        icon_url: member.user.displayAvatarURL(),
                    },
                    description: 'This user was unblocked. They will be able to communicate with MailBot again.',
                    footer: {
                        text: 'Unblocked'
                    }
                })
                .setTimestamp()
            ]
        });
    }
}