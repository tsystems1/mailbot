import { CategoryChannel, GuildChannel } from "discord.js";
import DiscordClient from "../client/Client";

export async function mailCategory(client: DiscordClient) {
    return <CategoryChannel> client.guilds.cache.get(process.env.GUILD_ID!)!.channels.cache.get(client.config.mail_category);
}

export async function getChannel(client: DiscordClient, id: string) {
    return <GuildChannel> client.guilds.cache.get(process.env.GUILD_ID!)!.channels.cache.get(id);
}

export function formatSize(size: number) {
    let unit = 'B';
    let newSize = size;

    if (size >= (1024 ** 3)) {
        unit = 'GB';
        newSize = size / (1024 ** 3);
    }
    else if (size >= (1024 ** 2)) {
        unit = 'MB';
        newSize = size / (1024 ** 2);
    }
    else if (size >= 1024) {
        unit = 'KB';
        newSize = size / 1024;
    }

    return newSize.toFixed(2) + unit;
}

export function getGuild(client: DiscordClient) {
    return client.guilds.cache.get(process.env.GUILD_ID!);
}