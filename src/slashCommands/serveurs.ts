import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, MessageFlags } from 'discord.js';
import { SlashCommand } from '../types';
import { ServeursDatabase } from "../database/serveursController";
import otterlogs from "../utils/otterlogs";

export const command: SlashCommand = {
    name: 'serveur',
    data: new SlashCommandBuilder()
        .setName('serveur')
        .setDescription('Permet d\'interagir avec les serveurs Minecraft.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Action que vous souhaitez effectuer avec le serveur.')
                .setRequired(true)
                .addChoices(
                    { name: 'Lancer', value: 'lancer' },
                    { name: 'Check', value: 'check' },
                    { name: 'Informations', value: 'infos' }
                )
        ),
    execute: async (interaction: CommandInteraction) => {
        otterlogs.log("Commande /serveur exécutée.");
        const db = new ServeursDatabase();
        const serveurPrimaire = await db.getServeurById(1);
        const serveurSecondaire = await db.getServeurById(2);

        await interaction.reply({
            content: `Voici les informations sur les serveurs Minecraft :\n
            Serveur primaire : ${serveurPrimaire.results[0].nom}\n
            Serveur secondaire : ${serveurSecondaire.results[0].nom}`,
            ephemeral: true
        });
    }
};
