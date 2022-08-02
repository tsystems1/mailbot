import {Message} from 'discord.js';
import DiscordClient from '../../client/Client';

export default abstract class BaseCommand {
    optionParse: boolean;

    constructor(private name: string, private category: string, private aliases: Array<string>) {
        this.optionParse = false;
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

    abstract run(client: DiscordClient, message: Message, args: Array<string> | null, options?: Array<string> | null, normalArgs?: Array<string> | null): Promise<void>;
}