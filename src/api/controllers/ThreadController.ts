import { Request } from "express";
import { isValidObjectId } from "mongoose";
import DiscordClient from "../../client/Client";
import { createThread } from "../../events/dm/DMCreateEvent";
import Thread from "../../models/Thread";
import Controller, { Action } from "../../utils/structures/Controller";
import Response from "../../utils/structures/Response";
import { client, getGuild } from "../../utils/util";

export default class ThreadController extends Controller {
    @Action('GET', '/threads')
    async index() {
        return await Thread.find();
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
            return { error: "Not a valid ID", code: 400 };
        }

        try {
            return await Thread.findById(request.params.id);
        }
        catch (e) {
            console.log(e);
            return { error: "Not found", code: 404 };
        }
    }
}