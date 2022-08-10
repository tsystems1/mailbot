import { Client, ClientOptions, Collection, Guild } from 'discord.js';
import BaseEvent from '../utils/structures/BaseEvent';
import BaseCommand from '../utils/structures/BaseCommand';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import path from 'path';
import Server from '../api/core/Server';

export interface Config {
    prefix: string;
    logging_channel: string;
    mail_category: string;
    max_files: number;
    role: string;
}

export default class DiscordClient extends Client {
    private _commands = new Collection<string, BaseCommand>();
    private _events = new Collection<string, BaseEvent>();
    private _prefix: string = '!';
    config: Config;

    server: Server;

    public static client: DiscordClient;
    
    constructor(options: ClientOptions) {
        super(options);
        DiscordClient.client = this;
        this.database(process.env.MONGO_URI!)
            .then(() => console.log('Database connected'))
            .catch(console.error);
        
        this.config = <Config> JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'config', 'config.json')).toString());
        this.server = new Server(this);

        this.server.run();
    }

    async database(uri: string) {
        return await mongoose.connect(uri);
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
