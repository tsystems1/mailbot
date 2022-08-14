import { CategoryChannel, EmbedBuilder, GuildChannel, TextChannel, User } from "discord.js";
import DiscordClient from "../client/Client";

export function mailCategory(client: DiscordClient) {
    return <CategoryChannel> client.guilds.cache.get(process.env.GUILD_ID!)!.channels.cache.get(client.config.mail_category);
}

export function loggingChannel(client: DiscordClient) {
    return <TextChannel> client.guilds.cache.get(process.env.GUILD_ID!)!.channels.cache.get(client.config.logging_channel);
}

export function getChannel(client: DiscordClient, id: string) {
    return <GuildChannel | undefined> client.guilds.cache.get(process.env.GUILD_ID!)!.channels.cache.get(id);
}

export async function getUser(input: string) {
    if (input.includes('#')) {
        return getGuild(DiscordClient.client)?.members.cache.find(m => m.user.tag === input);
    }
    else if (input.startsWith('<@') && input.endsWith('>')) {
        try {
            return await getGuild(DiscordClient.client)?.members.fetch(input.substring(2, input.length - 1));
        }
        catch (e) {
            console.log(e);
            return undefined;
        }
    }
    else {
        try {
            return await getGuild(DiscordClient.client)?.members.fetch(input);
        }
        catch (e) {
            console.log(e);
            return undefined;
        }
    }
}

export function stringToDate(str: string): number | undefined {
    let dateString = str.match(/(\d+) ?(second|minute|hour|day|week|month|year|sec|min|hr|dy|wk|mo|yr|s|mo|m|h|d|w|y)s?/i);

    if (dateString) {
        const [, value, unit] = dateString;
        let s = Number(value);

        switch (unit) {
            case 'm':
            case 'min':
            case 'minute':
                s *= 60;
            break;

            case 'h':
            case 'hr':
            case 'hour':
                s *= 60 * 60;
            break;
            
            case 'd':
            case 'dy':
            case 'day':
                s *= 60 * 60 * 24;
            break;
            
            case 'w':
            case 'wk':
            case 'week':
                s *= 60 * 60 * 24 * 7;
            break;
            
            case 'mo':
            case 'mon':
            case 'month':
                s *= 60 * 60 * 24 * 30;
            break;
            
            case 'y':
            case 'yr':
            case 'year':
                s *= 60 * 60 * 24 * 30 * 365;
            break;

            case 's':
            case 'sec':
            case 'second':
                return s;
        }

        if (s === Number(value)) {
            return;
        }

        return s;
    }
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

export function client() {
    return DiscordClient.client;
}

export function embed(...embeds: EmbedBuilder[]) {
    return {
        embeds
    };
}