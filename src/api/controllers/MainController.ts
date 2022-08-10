import Controller, { Action } from "../../utils/structures/Controller";
import Response from "../../utils/structures/Response";

export default class MainController extends Controller {
    @Action('GET', '/')
    async index() {
        return { message: "API is up." };
    }
}