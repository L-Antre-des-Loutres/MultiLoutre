const { SlashCommandBuilder } = require('discord.js');
const { config } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check-serveur')
        .setDescription(`Permet d'avoir des informations sur les serveurs actifs.`),
    async execute(interaction) {
        // Renvoi un message éphémère pour le moment dans le salon de l'utilisateur
        channel = await interaction.channel;
        await interaction.reply({ content: 'En cours de développement...', ephemeral: true });

    },
};
