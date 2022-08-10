import { Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";
import DiscordClient from "../../client/Client";
import { HTTPMethods } from "../../types/HTTPMethods";
import Controller from "../../utils/structures/Controller";
import Server from "./Server";
import { Router as ExpressRouter } from 'express';

export type RouterMap = {
    [key in HTTPMethods]: Collection<string, [Controller, string]>;
};

export default class Router {
    routes: RouterMap = {
        GET: new Collection(),
        POST: new Collection(),
        PUT: new Collection(),
        PATCH: new Collection(),
        DELETE: new Collection(),
    };

    controllers: Controller[] = [];
    expressRouter: ExpressRouter = ExpressRouter();

    constructor(protected client: DiscordClient, protected server: Server) {}

    public async loadRoutesFromController(filePath: string) {
        const { default: Controller } = await import(filePath);
        const controller = new Controller(this.client);
        this.controllers.push(controller);
    }

    public async loadRoutes(directory: string) {
        const files = await fs.readdir(directory);
        
        for (const file of files) {
            const stat = await fs.lstat(path.join(directory, file));
    
            if (stat.isDirectory())
                this.loadRoutes(path.join(directory, file));
    
            if (file.endsWith('.js') || file.endsWith('.ts')) {
                await this.loadRoutesFromController(path.join(directory, file));
            }
        }
    }
}