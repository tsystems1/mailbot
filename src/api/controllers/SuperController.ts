import Controller, { Action } from "../../utils/structures/Controller";

export default class SuperController extends Controller {
    @Action('GET', '/super')
    async index() {
        return "Super Controller";
    }

    @Action('GET', '/super/view')
    async view() {
        return 'Super';
    }
}