import { Events, Interaction } from "discord.js";
import { BotEvent } from "../types";
import otterlogs from "../utils/otterlogs";

const event: BotEvent = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        otterlogs.warn(`Commande nommée "${interaction.commandName}" exécutée par ${interaction.user.tag} (ID: ${interaction.user.id}), mais la commande n'existe pas ou plus. Les commandes sont-elles à jour ?`);
        const command = interaction.client.slashCommands.get(interaction.commandName);
        if (!command) return interaction.reply({ content: "Cette commande n'existe pas ou plus ! ", ephemeral: true });
        await command.execute(interaction);
    }
}

export default event;