const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serveur')
        .setDescription('Permet la gestion des serveurs de jeux Minecraft.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Lancer ou arrêter le serveur.')
                .setRequired(true)
                .addChoices(
                    { name: 'Lancer', value: 'lancer' },
                    { name: 'Arrêter', value: 'arrêter' },
                    { name: 'Informations', value: 'infos'}
                )
            )
        .addStringOption(option =>
            option.setName('serveur')
                .setDescription('Le serveur principale (La Vanilla) ou un serveur secondaire.')
                .setRequired(true)
                .setAutocomplete(true)
            ),
    async autocomplete(interaction) {
        // Récupère les données de l'API pour l'autocomplétion des serveurs
        const ApiLink = 'https://api.antredesloutres.fr/serveurs/actifs/jeu/Minecraft';
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(ApiLink);
            if (!response.ok) {
                console.error(`[ERROR] Erreur HTTP : ${response.status}`);
                throw new Error(`[ERROR] Erreur HTTP : ${response.status}`);
            }
            const data = await response.json();
            // console.log('[INFO] Données récupérées avec succès : ', data);

            const choices = data.map(element => ({
                name: element.nom_serv,
                value: element.id_serv
            }));

            // console.log('[INFO] Envoi des données pour l\'autocomplétion : ', choices);
            await interaction.respond(choices);
        } catch (error) {
            console.error('[ERROR] Erreur lors de la récupération des données pour l\'autocomplétion : ', error);
            await interaction.respond([
                {
                    name: 'Error',
                    value: 'Une erreur est survenue !'
                }
            ]).catch(err => console.error('[ERROR] Erreur lors de la réponse à l\'interaction : ', err));
        }
    },
    async execute(interaction) {
        const id_serv = interaction.options.getString('serveur');
        const action = interaction.options.getString('action');

        const { token_api } = require('../../config.json');

        if (!id_serv) {
            // Une réponse aléatoire parmi celles proposées
            const responses = [
                'Vous devez choisir un serveur parmi La Vanilla ou les serveurs secondaires.',
                'Il faut choisir un serveur pour pouvoir effectuer une action.',
                'Veuillez choisir un serveur pour effectuer une action.',
                'Il semblerait que vous ayez oublié de choisir un serveur.',
                'Il me manque le serveur sur lequel effectuer l\'action.',
                'Je crois que vous avez oublié de choisir un serveur 🥸',
                'Mmmmh il manque le serveur pour effectuer l\'action 🥸',
                'Ouais mais en fait il faut choisir un serveur pour effectuer une action 🥸'
            ];
            // console.log('[INFO] ' + interaction.user.username + ' a oublié de choisir un serveur. Réponse aléatoire renvoyée.');
            await interaction.reply('' + responses[Math.floor(Math.random() * responses.length)]);
            return;
        }

        try {
            let ApiLink;
            if (action === 'lancer') {
                ApiLink = 'https://api.antredesloutres.fr/serveurs/start';
            } else if (action === 'arrêter') {
                ApiLink = 'https://api.antredesloutres.fr/serveurs/stop';
            } else {
                // Une réponse aléatoire parmi celles proposées
                const responses = [
                    'Vous devez choisir une action parmi lancer ou arrêter.',
                    'Il faut choisir une action pour pouvoir effectuer une action.',
                    'Veuillez choisir une action pour effectuer une action. Genre uh, lancer ou arrêter. Tu vois?',
                    'Il faut choisir une action pour pouvoir effectuer une action 🥸',
                    "D'accord mais je ne sais pas quoi faire si vous ne choisissez pas une action 🥸",
                ];
                // console.log('[INFO] ' + interaction.user.username + ' a oublié de choisir une action. Réponse aléatoire renvoyée.');
                await interaction.reply('' + responses[Math.floor(Math.random() * responses.length)]);
                return;
            }

            const fetch = (await import('node-fetch')).default;
            const response = await fetch(ApiLink, {
                method: 'POST',
                body: JSON.stringify({ id_serv: id_serv, client_token: token_api }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Failed to process server action: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            // console.log('[INFO] Résultat de la requête:', data);

            if (data.status === "0") {
                await interaction.reply(`Le serveur est déjà ${action === 'lancer' ? 'démarré' : 'arrêté'}.`);
            } else {
                console.log(`[INFO] ${interaction.user.username} a ${action === 'lancer' ? 'démarré' : 'arrêté'} le serveur ${id_serv}.`);
                await interaction.reply(`Le serveur est en cours de ${action === 'lancer' ? 'démarrage' : 'arrêt'}.`);
            }
        } catch (error) {
            console.error('[ERROR] Erreur lors de la requête API:', error);
            await interaction.reply(`Erreur lors de l'${action === 'lancer' ? 'démarrage' : 'arrêt'} du serveur.`);
        }
    }
};
