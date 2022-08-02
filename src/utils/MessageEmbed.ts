import { MessageEmbed as ME } from "discord.js";

export default class MessageEmbed extends ME {
    constructor() {
        super();
        this.setColor('#007bff');
    }
};