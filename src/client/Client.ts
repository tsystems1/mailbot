import { Client, ClientOptions, Collection } from 'discord.js';
import BaseEvent from '../utils/structures/BaseEvent';
import BaseCommand from '../utils/structures/BaseCommand';
import Database from './Database';
import Config from './Config';

export default class DiscordClient extends Client {
    private _commands = new Collection<string, BaseCommand>();
    private _events = new Collection<string, BaseEvent>();
    private _prefix: string = '!';

    db: Database;
    config: Config;

    constructor(options: ClientOptions) {
        super(options);
        this.db = new Database(process.env.DB_HOST!);
        this.config = new Config();
    }

    get commands(): Collection<string, BaseCommand> { 
        return this._commands;
    }

    get events(): Collection<string, BaseEvent> { 
        return this._events;
    }

    get prefix(): string {
        return this._prefix;
    }

    set prefix(prefix: string) {
        this._prefix = prefix;
    }
}