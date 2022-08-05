import { Attachment, AttachmentBuilder, EmbedBuilder, Message, TextChannel, User } from "discord.js";
import DiscordClient from "../../client/Client";
import Client from "../../client/Client";
import Thread from "../../models/Thread";
import BaseEvent from "../../utils/structures/BaseEvent";
import { formatSize, getChannel, mailCategory } from "../../utils/util";

export default class DMUpdateEvent extends BaseEvent {
    constructor() {
        super('dmUpdate');
    }

    async run(client: Client, oldMessage: Message, newMessage: Message) {
        let thread = await Thread.findOne({ user: newMessage.author.id });
        
        if (!thread) {
           return;
        }
        
        let channel = <TextChannel> await getChannel(client, thread.channel);

        if (!channel) {
            return;
        }

        await channel.send({
            embeds: [
                new EmbedBuilder({
                    author: {
                        name: newMessage.author.tag,
                        iconURL: newMessage.author.displayAvatarURL(),
                    },
                    description: `**===Before===**\n${oldMessage.content}\n\n**+++===After===**\n${newMessage.content}`,
                    footer: {
                        text: `Updated • ${newMessage.id}`
                    }
                })
                .setTimestamp()
            ]
        });
    }
}