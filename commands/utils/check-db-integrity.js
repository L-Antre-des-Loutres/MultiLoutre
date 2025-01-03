const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { dbIntegrityCheck } = require('../../events/dbIntegrityCheck.js');
const { log_i, log_s, log_e, error_c, reset_c, important_c } = require('../../color_code.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check-db-integrity')
    .setDescription('Vérifie l\'intégrité de la base de données.'),

  async execute(interaction) {
    try {
      // Envoie un message pour indiquer que la vérification a commencé
      await interaction.reply({
        content: 'Vérification de l\'intégrité de la base de données en cours...',
        flags: MessageFlags.Ephemeral
      });

      // Appeler l'événement dbIntegrityCheck pour effectuer la vérification
      await dbIntegrityCheck.execute(); // On appelle la fonction pour vérifier l'intégrité

      // Répondre après que la vérification soit terminée
      await interaction.followUp({
        content: 'La vérification de l\'intégrité de la base de données est terminée.',
        flags: MessageFlags.Ephemeral
      });

    } catch (error) {
      console.log(log_e + 'Erreur lors de la commande de vérification de l\'intégrité de la base de données : "', error_c + error + reset_c + '"');
      await interaction.followUp({
        content: 'Une erreur est survenue lors de la vérification de l\'intégrité de la base de données.',
        flags: MessageFlags.Ephemeral
      });
    }
  },
};
