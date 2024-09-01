const { Events, ActivityType, Colors, ChannelType, PermissionFlagsBits } = require('discord.js');
const { categoryName, roleName} = require('../config.json');
const fs = require('fs');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const guild = client.guilds.cache.first(); // Identifiant du serveur

        // Ici ont crée des salons et un rôle pour les logs
        const channelNames = ['❌logs-erreur-mineotter', '📃logs-mineotter', "🍔mcmyadmin-primaire", "🍟mcmyadmin-secondaire"];
        
        try {
            const channelsDiscord = guild.channels.cache.map(channel => channel.name);

            // Vérifie si le rôle existe déjà
            let role = guild.roles.cache.find(r => r.name === roleName);
            if (!role) {
                role = await guild.roles.create({
                    name: roleName,
                    color: Colors.Blue,
                    reason: 'Role pour les logs Minotter',
                });
                console.log(`[INFO] Rôle "${roleName}" créé !`);
                // console.log(`[INFO] Le rôle "${roleName}" existe déjà`);
            }

            // Vérifie si la catégorie existe déjà
            let category = guild.channels.cache.find(channel => channel.name === categoryName && channel.type === ChannelType.GuildCategory);
            if (!category) {
                category = await guild.channels.create({
                    name: categoryName,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: role.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });
                console.log(`[INFO] Catégorie "${categoryName}" créée avec les permissions adéquates !`);
            } else {
                // console.log(`[INFO] La catégorie "${categoryName}" existe déjà`);
            }

            // Crée des salons à l'intérieur de la catégorie avec les mêmes permissions
            for (const channelName of channelNames) {
                if (channelsDiscord.includes(channelName)) {
                    // console.log(`[INFO] Le salon "${channelName}" existe déjà`);
                } else {
                    await guild.channels.create({
                        name: channelName,
                        type: ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.id,
                                deny: [PermissionFlagsBits.ViewChannel],
                            },
                            {
                                id: role.id,
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });
                    console.log(`[INFO] Salon "${channelName}" créé !`);
                }
            }
        } catch (error) {
            console.error(`[ERROR] Erreur lors de la création d'un salons : ${error}`);
        }

        // Ici ont récupère les ID des salons importants
        const channelnameToGetId = ['❌logs-erreur-mineotter', '📃logs-mineotter', '🌌・discu-mc', '🍔mcmyadmin-primaire', '🍟mcmyadmin-secondaire'];
        if (!fs.existsSync('./config.json')) {
            console.error('[ERROR] Le fichier config.json n\'existe pas ou n\'est pas accessible.');
        } else {
            for (const channelName of channelnameToGetId) {
                if (channelName) {
                    const channelId = guild.channels.cache.find(channel => channel.name === channelName).id;
                    try {
                        // Lecture du fichier de configuration
                        const config = JSON.parse(fs.readFileSync("./config.json", 'utf8'));
                        
                        if (channelName === '❌logs-erreur-mineotter') {
                            channelNameJSON = "channelLogsErrorID";
                        } else if (channelName === '📃logs-mineotter') {
                            channelNameJSON = "channelLogsID";
                        } else if (channelName === '🌌・discu-mc') {
                            channelNameJSON = "channelMcDiscordID";
                        } else if (channelName === '🍔mcmyadmin-primaire') {
                            channelNameJSON = "channelMcMyAdminPrimaryID";
                        } else if (channelName === '🍟mcmyadmin-secondaire') {
                            channelNameJSON = "channelMcMyAdminSecondaryID";
                        }
                        config[channelNameJSON] = channelId;
                    
                        // Écriture du fichier de configuration
                        fs.writeFileSync("./config.json", JSON.stringify(config, null, 4), 'utf8');
                        console.log('[INFO] Le salon', '\x1b[34m', `${channelName}`, '\x1b[0m', 'avec l\'ID', '\x1b[36m', `${channelId}`, '\x1b[0m', 'a été ajouté/mis à jour dans config.json');
                    } catch (error) {
                        console.error('[ERROR] Erreur lors de la mise à jour du fichier config.json :', error);
                    }
                } else {
                    console.error(`[ERROR] Le salon "${channelName}" n'a pas été trouvé.`);
                }
            }
        }

        // Et ici la vérification de si l'API est bien en ligne
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch('https://api.antredesloutres.fr/');
            const data = await response.json();
            console.log(`[INFO] API bien en ligne 👍`);
        } catch (error) {
            console.error('[ERROR] Erreur avec l\'API : ', error);
        }

        // Ont termine par mettre le bot en ligne
        console.log(`[INFO] Connecté en tant que ${client.user.tag} !`);

        client.user.setActivity({
            type: ActivityType.Custom,
            name: 'customstatus',
            state: '🦦 Je gère les serveurs Minecraft !'
        });
    },
};