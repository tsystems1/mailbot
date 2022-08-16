import { Request } from "express";
import { isValidObjectId } from "mongoose";
import DiscordClient from "../../client/Client";
import { createThread } from "../../events/dm/DMCreateEvent";
import Thread from "../../models/Thread";
import Controller, { Action } from "../../utils/structures/Controller";
import Response from "../../utils/structures/Response";
import { client, fetchUser, getChannel, getGuild } from "../../utils/util";
import AuthMiddleware from "../middleware/AuthMiddleware";

export default class ThreadController extends Controller {
    middleware(): { [action: string]: Function[]; } {
        return { "*": [AuthMiddleware] };
    }

    @Action('GET', '/threads')
    async index() {
        const threads = await Thread.find().limit(30);
        const transformed = [];

        for await (const thread of threads) {
            transformed.push({
                ...thread.toJSON(),
                channel: getChannel(client(), thread.channel),
                user: await fetchUser(client(), thread.user),
                createdBy: await fetchUser(client(), thread.createdBy),
            });
        }

        return transformed;
    }

    @Action('POST', '/threads')
    async create(request: Request) {
        const { body } = request;

        if (typeof body !== 'object' || !body.user) {
            return { error: "Request body must be a valid object." };
        }

        try {
            const member = await (getGuild(client()))?.members.fetch(body.user);

            if (!member) {
                throw new Error("Member not found");
            }

            return await createThread(client(), null, member.user);
        }
        catch (e) {
            console.log(e);
            return { error: "Invalid user ID or failed to fetch user information." };
        }
    }

    @Action('GET', '/threads/:id')
    async view(request: Request) {
        if (!isValidObjectId(request.params.id)) {
            return new Response(400, { error: 'Not a valid ID' });
        }

        try {
            const thread = await Thread.findById(request.params.id);

            if (!thread) {
                throw new Error('Not found');
            }

            return {
                ...thread.toJSON(),
                channel: getChannel(client(), thread.channel),
                user: await fetchUser(client(), thread.user),
                createdBy: await fetchUser(client(), thread.createdBy),
            };
        }
        catch (e) {
            console.log(e);
            return new Response(404, { error: 'Not found' });
        }
    }
}