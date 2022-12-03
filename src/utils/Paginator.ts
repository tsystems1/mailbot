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

import Client from "../client/Client";
import { v4 as uuid } from 'uuid';
import { ButtonInteraction, InteractionCollector, EmbedBuilder, InteractionReplyOptions, Message, ActionRowBuilder, ButtonBuilder, MessageEditOptions, MessagePayload, MessageReplyOptions, MessageActionRowComponent, ButtonStyle, InteractionType, ComponentType } from "discord.js";

export interface EmbedBuilderOptions<T> {
    data: Array<T>;
    currentPage: number;
    maxPages: number;
}

export interface FetchDataOption {
    currentPage: number;
    offset: number;
    limit: number;
}

export interface PaginationOptions<T> {
    limit: number;
    guild_id: string;
    channel_id: string;
    user_id?: string;
    timeout?: number;
    maxData?: (options: FetchDataOption) => Promise<number>;
    fetchData?: (options: FetchDataOption) => Promise<T[]>;
    messageOptions?: MessageReplyOptions & MessagePayload & InteractionReplyOptions & MessageEditOptions;
    embedBuilder: (options: EmbedBuilderOptions<T>) => EmbedBuilder;
    actionRowBuilder?: (options: { first: boolean, last: boolean, next: boolean, back: boolean }) => ActionRowBuilder<ButtonBuilder>;
}

export default class Paginator<T> {
    protected readonly client = Client.client;
    protected readonly id: string;
    protected maxPage: number = 0;
    protected currentPage: number = 1;
    protected currentData: T[] = [];

    constructor(protected readonly data: Array<T> | null = [], protected readonly options: PaginationOptions<T>) {
        this.id = uuid();
    }

    getOffset(page: number = 1) {
        return (page - 1) * this.options.limit;
    }

    async getPaginatedData(page: number = 1) {
        console.log(page, this.getOffset(page));

        if (this.options.fetchData)
            this.currentData = await this.options.fetchData({
                currentPage: page,
                limit: this.options.limit,
                offset: this.getOffset(page)
            });

        return this.data ? this.data.slice(this.getOffset(page), this.getOffset(page) + this.options.limit) : this.currentData;
    }

    async getEmbed(page: number = 1): Promise<EmbedBuilder> {
        const data = await this.getPaginatedData(page);

        return this.options.embedBuilder({
            data: this.data ? data : this.currentData,
            currentPage: this.currentPage,
            maxPages: Math.ceil((this.data?.length ?? this.maxPage) / this.options.limit),
        });
    }

    async getMessageOptions(page: number = 1, actionRowOptions: { first: boolean, last: boolean, next: boolean, back: boolean } | undefined = undefined, optionsToMerge: (MessageReplyOptions & MessagePayload & InteractionReplyOptions & MessageEditOptions) | {} = {}) {
        const options = {...this.options.messageOptions, ...optionsToMerge};
        const actionRowOptionsDup = actionRowOptions ? {...actionRowOptions} : { first: true, last: true, next: true, back: true };

        if (this.options.maxData && this.maxPage === 0)
            this.maxPage = await this.options.maxData({
                currentPage: page,
                limit: this.options.limit,
                offset: this.getOffset(page)
            });

        console.log("Max Page", this.maxPage);

        if (actionRowOptionsDup && page <= 1) {
            actionRowOptionsDup.back = false;
            actionRowOptionsDup.first = false;
        }

        if (actionRowOptionsDup && page >= Math.ceil((this.data?.length ?? this.maxPage) / this.options.limit)) {
            actionRowOptionsDup.last = false
            actionRowOptionsDup.next = false;
        }

        options.embeds ??= [];
        options.embeds.push(await this.getEmbed(page));
        
        options.components ??= [];
        options.components = [this.getActionRow(actionRowOptionsDup), ...options.components];

        return options;
    }

    getActionRow({ first, last, next, back }: { first: boolean, last: boolean, next: boolean, back: boolean } = { first: true, last: true, next: true, back: true }) {
        if (this.options.actionRowBuilder) {
            return this.options.actionRowBuilder({ first, last, next, back });
        }

        const actionRow = new ActionRowBuilder<ButtonBuilder>();

        actionRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`pagination_first_${this.id}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!first)
                .setEmoji('⏪'),
            new ButtonBuilder()
                .setCustomId(`pagination_back_${this.id}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!back)
                .setEmoji('◀'),
            new ButtonBuilder()
                .setCustomId(`pagination_next_${this.id}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!next)
                .setEmoji('▶'),
            new ButtonBuilder()
                .setCustomId(`pagination_last_${this.id}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!last)
                .setEmoji('⏩')
        );

        return actionRow;
    }

    async start(message: Message) {
        const collector = new InteractionCollector(this.client, {
            guild: this.options.guild_id,
            channel: this.options.channel_id,
            interactionType: InteractionType.MessageComponent,
            componentType: ComponentType.Button,
            message,
            time: this.options.timeout ?? 60_000,
            filter: interaction => {
                if (interaction.inGuild() && (!this.options.user_id || interaction.user.id === this.options.user_id)) {
                    return true;
                }

                if (interaction.isRepliable()) {
                    interaction.reply({ content: 'That\'s not under your control or the button controls are expired', ephemeral: true });
                }

                return false;
            },
        });

        collector.on("collect", async (interaction: ButtonInteraction) => {
            if (!interaction.customId.endsWith(this.id)) {
                return;
            }

            // await interaction.deferUpdate();
            
            const maxPage = Math.ceil((this.data?.length ?? this.maxPage) / this.options.limit);
            const componentOptions = { first: true, last: true, next: true, back: true };

            if ([`pagination_next_${this.id}`, `pagination_back_${this.id}`].includes(interaction.customId)) {
                console.log('here');

                if (this.currentPage >= maxPage && interaction.customId === `pagination_next_${this.id}`) {
                    console.log('here');
                    await interaction.reply({ content: maxPage === 1 ? "This is the only page!" : "You've reached the last page!", ephemeral: true });
                    return;
                }

                if (this.currentPage <= 1 && interaction.customId === `pagination_back_${this.id}`) {
                    console.log('here');
                    await interaction.reply({ content: maxPage === 1 ? "This is the only page!" : "You're in the very first page!", ephemeral: true });
                    return;
                }
            }

            if (interaction.customId === `pagination_first_${this.id}`)
                this.currentPage = 1;
            else if (interaction.customId === `pagination_last_${this.id}`)
                this.currentPage = maxPage;            

            await interaction.update(await this.getMessageOptions(
                interaction.customId === `pagination_first_${this.id}` ? 1 : 
                    interaction.customId === `pagination_last_${this.id}` ? maxPage :
                        (interaction.customId === `pagination_next_${this.id}` ? (this.currentPage >= maxPage ? this.currentPage : ++this.currentPage) : --this.currentPage),
                componentOptions,
                {
                    embeds: [],
                    ...(this.options.messageOptions ?? {})
                }
            ));
        });

        collector.on("end", async () => {
            const [component, ...components] = message.components!; // this.getActionRow({ first: false, last: false, next: false, back: false })

            for (const i in component.components) {
                component.components[i] = { ...component.components[i], disabled: true } as MessageActionRowComponent;
            }

            try {
                await message.edit({ components: [component, ...components] });
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
