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

import { Message, CommandInteraction, CacheType, EmbedBuilder } from "discord.js";
import Client from "../../client/Client";
import CommandOptions from "../../types/CommandOptions";
import BaseCommand from "../../utils/structures/BaseCommand";

export default class AboutCommand extends BaseCommand {
    metadata = require('../../../package.json');
    
    constructor() {
        super('about', 'settings', ['info', 'botinfo']);
    }

    async run(client: Client, message: Message<boolean> | CommandInteraction<CacheType>, options?: CommandOptions | undefined): Promise<void> {
        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ iconURL: client.user?.displayAvatarURL(), name: "MailBot" })
                    .setDescription(`
                        A free and open source Discord Bot for private communication with server staff, specially created for **The Everything Server**.

                        Copyright (C) ${new Date().getFullYear()} OSN Inc.
                        This bot comes with ABSOLUTELY NO WARRANTY.
                        This is free software, and you are welcome to redistribute it under certain conditions.
                        See the [GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.en.html) for more detailed information.
                    `)
                    .addFields({
                        name: 'Version',
                        value: this.metadata.version,
                        inline: true
                    }, {
                        name: 'Source Code',
                        value: `[GitHub](${this.metadata.repository.url})`,
                        inline: true,
                    }, {
                        name: 'Licensed Under',
                        value: `[GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.en.html)`,
                        inline: true
                    })
                    .addFields({
                        name: "Author",
                        value: `[${this.metadata.author.name}](${this.metadata.author.url})`,
                        inline: true
                    }, {
                        name: 'Support',
                        value: this.metadata.author.email,
                        inline: true
                    })
                    .setFooter({
                        text: `Copyright © OSN Inc 2022. All rights reserved.`
                    })
                    .setColor('#007bff')
            ]
        });
    }
}