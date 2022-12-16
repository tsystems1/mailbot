/**
* This file is part of MailBot.
* 
* Copyright (C) 2021-2022 OSN Inc.
*
* MailBot is free software; you can redistribute it and/or modify it
* under the terms of the GNU Affero General Public License as published by 
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* MailBot is distributed in the hope that it will be useful, but
* WITHOUT ANY WARRANTY; without even the implied warranty of 
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License 
* along with MailBot. If not, see <https://www.gnu.org/licenses/>.
*/

import BaseEvent from '../../utils/structures/BaseEvent';
import DiscordClient from '../../client/Client';
import { ActivityType } from 'discord.js';

export default class ReadyEvent extends BaseEvent {
    constructor() {
        super('ready');
    }
    async run(client: DiscordClient) {
        console.log('Bot has logged in.', client.server.router.routes);
        
        await client.user.presence.set({
            status: 'online',
            activities: [
                {
                    name: 'DM me to contact staff!',
                    type: ActivityType.Playing,
                    url: 'https://github.com/onesoft-sudo/mailbot'
                }
            ]
        })
    }
}