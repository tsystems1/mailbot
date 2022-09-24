import express, { Router } from "express";
import DiscordClient from "../../client/Client";
import { HTTPMethods } from "../../types/HTTPMethods";
import { client } from "../utils";
import Response from "./Response";

export default abstract class Controller {
    constructor(protected client: DiscordClient) {}
    middleware(): { [action: string]: Function[] } {
        return {};
    }
}

export function Action(method: HTTPMethods, route: string, middlewareList: Function[] = []) {
    return (target: Controller, key: string) => {
        DiscordClient.client.server.router.routes[method].set(route, [target, key]);
        const middleware = [...(client().server.router.globalMiddleware), ...middlewareList, ...(target.middleware()['*'] ?? []), ...(target.middleware()[key] ?? [])];

        (DiscordClient.client.server.router.expressRouter[method.toLowerCase() as keyof Router] as Function)(route, ...middleware, async (...args: any) => {
            const result = await (target[key as keyof Controller] as Function).call(target, ...args);
            console.log(result, key);

            if (result && args[1]) {
                if (result instanceof Response) {
                    const res = (args[1] as express.Response);

                    for (let header in result.headers) {
                        res.setHeader(header, result.headers[header]);
                    }

                    await res.status(result.code).send(result.content);
                    return;
                }

                await args[1].send(result);
            }
        });
    };
}