const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { dbServeursIntegrityCheck } = require('../../utils/dbServeursIntegrityCheck');
const { bot_color } = require('../../config.json');
const { log_i, log_s, log_e, error_c, reset_c, important_c } = require('../../color_code.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-check-database')
    .setDescription('Vérifie l\'intégrité de la base de données.'),

  async execute(interaction) {
    /*
    try {
      await interaction.reply('Vérification de l\'intégrité de la base de données en cours...');
      
      // Appelle la fonction de vérification de l'utilitaire dbServeursIntegrityCheck
      const results = await dbServeursIntegrityCheck();
      console.log(log_i + `Résultats de la vérification : ${important_c}${JSON.stringify(results)}${reset_c}`);

      const connection = results.find(r => r.connection)?.connection || "🟡 Non disponible";
      const tables = results.find(r => r.tables)?.tables || "🟡 Non disponible";
      const foreignKeys = results.find(r => r.foreign_keys)?.foreign_keys || "🟡 Non disponible";
      const investisseurs = results.find(r => r.investisseurs)?.investisseurs || "🟡 Non disponible";
      const administrateurs = results.find(r => r.administrateurs)?.administrateurs || "🟡 Non disponible";

      const embed = new EmbedBuilder()
        .setTitle('Voici les résultats de la base de données "serveurs" :')
        .setDescription(
          `**Connection :**\n${connection}\n` +
          `**Tables :**\n${tables}\n` +
          `**Foreign Keys :**\n${foreignKeys}\n` +
          `**Investisseurs :**\n${investisseurs}\n` +
          `**Administrateurs :**\n${administrateurs}`
        )
        .setColor(bot_color)
        .setFooter({
          text: "Mineotter",
          iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], content: 'Vérification terminée.' });
    } catch (error) {
      console.log(log_e + 'Erreur lors de la vérification : ', error_c + error + reset_c);
      await interaction.editReply('Une erreur est survenue lors de la vérification.');
    }
    */
    await interaction.reply('Désactivé pour le moment.');
  },
};
