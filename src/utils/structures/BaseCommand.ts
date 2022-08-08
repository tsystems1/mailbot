import { CommandInteraction, Guild, GuildChannel, GuildMember, InteractionDeferUpdateOptions, Message, MessageOptions, MessagePayload, PermissionsBitField, Role, RoleResolvable } from 'discord.js';
import DiscordClient from '../../client/Client';
import CommandOptions from '../../types/CommandOptions';

export default abstract class BaseCommand {
    public readonly mailOnly: boolean = false;
    public readonly roles: RoleResolvable[] = [];
    public readonly requireModRole: boolean = true;
    public readonly permissions: PermissionsBitField | null = null;

    constructor(private name: string, private category: string, private aliases: Array<string>) {
        
    }

    getName(): string {
        return this.name;
    }

    getCategory(): string {
        return this.category;
    }

    getAliases(): Array<string> {
        return this.aliases;
    }

    async deferedReply(msg: Message | CommandInteraction, options: MessageOptions | MessagePayload) {
        if (msg instanceof Message) 
            await msg.reply(options as MessageOptions);
        else {
            if (msg.deferred) {
                await msg.editReply(options as MessagePayload);
            }
            else {
                await msg.reply(options as MessagePayload);
            }
        }
    }

    public async execute(client: DiscordClient, message: Message | CommandInteraction, options?: CommandOptions) {
        if (this.roles.length > 0 || this.requireModRole) {
            let member: GuildMember;

            if (message instanceof Message) {
                member = message.member!;
            }
            else {
                member = await message.guild!.members.fetch(message.member!.user.id);
            }

            for await (const role of [...this.roles, client.config.role]) {
                if (!member.roles.cache.has(role instanceof Role ? role.id : role)) {
                    await message.reply({
                        embeds: [
                            {
                                description: ':x: You don\'t have permission to run this command.',
                                color: 0xf14a60
                            }
                        ]
                    });
    
                    return;
                }
            }
        }

        if (this.permissions) {
            if ((message instanceof CommandInteraction && !message.memberPermissions?.has(this.permissions)) || (message instanceof Message && !message.member?.permissions.has(this.permissions))) {
                await message.reply({
                    embeds: [
                        {
                            description: ':x: You don\'t have enough permissions to run this command.',
                            color: 0xf14a60
                        }
                    ]
                });

                return;
            }
        }

        if (this.mailOnly) {
            const { mail_category } = client.config;

            if ((message.channel! as GuildChannel).parent?.id !== mail_category) {
                await message.reply({
                    embeds: [
                        {
                            description: ':x: You can only run this command inside a mail thread.',
                            color: 0xf14a60
                        }
                    ]
                });

                return;
            }
        }

        return await this.run(client, message, options);
    }

    abstract run(client: DiscordClient, message: Message | CommandInteraction, options?: CommandOptions): Promise<void>;
}