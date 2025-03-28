import { SlashCommandBuilder, EmbedBuilder, CommandInteraction, StringSelectMenuBuilder, ActionRowBuilder, MessageFlags } from 'discord.js';
import { SlashCommand } from '../types';
import axios from 'axios';
import otterlogs from "../utils/otterlogs";

export const command: SlashCommand = {
    name: 'cripieclub-start',
    data: new SlashCommandBuilder()
        .setName('cripieclub-start')
        .setDescription('Permet de lancer le serveur CripieClub. (La commande changera bientôt, celle-ci est temporaire)'),
    execute: async (interaction: CommandInteraction) => {
        otterlogs.log("Lancement du serveur CripieClub.");
        // Url : https://api.antredesloutres.fr/serveurs/start/ : POST
        // Body : { "client_token": "API_TOKEN", "id_serv": 19 }
        let client_token = process.env.API_TOKEN;
        let id_serv = 19;
        
        const response = await axios.post('https://api.antredesloutres.fr/serveurs/start/', {
            client_token: client_token,
            id_serv: id_serv
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        await interaction.reply({
            content: `Le serveur CripieClub a bien été lancé, s'il ne l'était pas déjà. Il devrait être disponible dans quelques instants.`,
            ephemeral: true
        });
    }
};
