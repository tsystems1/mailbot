import BaseEvent from "../utils/structures/BaseEvent";
import DiscordClient from "../client/Client";
import { exec } from "child_process";

export default class DebugEvent extends BaseEvent {
    timeout: any = null;
    
    constructor() {
        super("debug");
    }

    async run(client: DiscordClient, log: string) {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        
        if (log.includes("Provided token") || log.includes(process.env.TOKEN!) || log.includes("[READY] Session ")) {
            console.log('DEBUG: [One hidden log]');
            return;
        }

        console.log("DEBUG: ", log);

        if (process.env.PLATFORM === 'replit' && log.includes("Preparing to connect to the gateway") && !client.isReady()) {
            this.timeout = setTimeout(() => {
                console.log("DEBUG: ", "[1] Restart Required");
                exec("kill 1");
            }, 20_000);
        }
        
        if (process.env.PLATFORM === 'replit' && log.includes("Hit a 429") && !client.isReady()) {
            console.log("DEBUG: ", "Restart Required");
            
            exec("kill 1");
            return;
        }
    }
}
