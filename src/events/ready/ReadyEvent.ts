import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/Client';

export default class ReadyEvent extends BaseEvent {
    constructor() {
        super('ready');
    }
    async run(client: DiscordClient) {
        console.log('The system has logged into discord!');
    }
}