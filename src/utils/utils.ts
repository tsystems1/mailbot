import { ChannelType, GuildChannel } from "discord.js";
import DiscordClient from "../client/Client";

export async function categoryChannel(client: DiscordClient) {
    return client.guilds.cache.get(process.env.GUILD_ID!)?.channels.cache.find(c => c.id === client.config.props.mail_category && c.type === ChannelType.GuildCategory);
}

export async function getChannel(client: DiscordClient, id: string) {
    return <GuildChannel | null> client.guilds.cache.get(process.env.GUILD_ID!)?.channels.cache.find(c => c.id === id);
}