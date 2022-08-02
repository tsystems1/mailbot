import { Client, ClientOptions, Collection, Guild } from 'discord.js';
import BaseEvent from '../utils/structures/BaseEvent';
import BaseCommand from '../utils/structures/BaseCommand';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import path from 'path';

export default class DiscordClient extends Client {
    private _commands = new Collection<string, BaseCommand>();
    private _events = new Collection<string, BaseEvent>();
    private _prefix: string = '!';
    config: { [key: string]: any } = {};
    
    constructor(options: ClientOptions) {
        super(options);
        this.database(process.env.MONGO_URI!)
            .then(() => console.log('Database connected'))
            .catch(console.error);
        
        this.config = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'config', 'config.json')).toString());
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
