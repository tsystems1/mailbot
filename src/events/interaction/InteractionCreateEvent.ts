import { ChannelType, Interaction } from "discord.js";
import DiscordClient from "../../client/Client";
import BaseEvent from "../../utils/structures/BaseEvent";

export default class InteractionCreateEvent extends BaseEvent {
    constructor() {
        super('interactionCreate');
    }

    async run(client: DiscordClient, interaction: Interaction): Promise<void> {
        if (!interaction.guild || interaction.channel?.type === ChannelType.DM) {
            if (interaction.isRepliable()) {
                await interaction.reply({
                    content: "You cannot use slash commands of this bot on DMs.",
                    ephemeral: true
                });
            }

            return;
        }

        if (interaction.isChatInputCommand()) {
            const { commandName } = interaction;
            const command = client.commands.get(commandName);

            if (command) {
                await command.execute(client, interaction);
            }
        }
    }
}