import BaseEvent from "../../utils/structures/BaseEvent";
import DiscordClient from "../../client/Client";
import { exec } from "child_process";

export default class DebugEvent extends BaseEvent {
    constructor() {
        super("debug");
    }

    async run(client: DiscordClient, log: string) {
        if (log.includes("Provided token") || log.includes(process.env.TOKEN!) || log.includes("[READY] Session ")) {
            console.log('DEBUG: [One hidden log]');
            return;
        }

        console.log("DEBUG: ", log);
        
        if (process.env.PLATFORM === 'replit' && log.includes("Hit a 429") && !client.isReady()) {
            console.log("DEBUG: ", "Restart Required");
            
            exec("kill 1");
            return;
        }
    }
}
