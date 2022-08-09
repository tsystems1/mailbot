import Controller, { Action } from "../../utils/structures/Controller";
import Response from "../../utils/structures/Response";

export default class UserController extends Controller {
    @Action('GET', '/')
    async index() {
        return new Response(404, 'Not found');
    }

    @Action('GET', '/test')
    async view() {
        return { test: 'test' };
    }
}