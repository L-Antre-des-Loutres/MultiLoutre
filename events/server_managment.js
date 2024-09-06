const { Events, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { token_api } = require('../config.json');

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {},

    async install_server(client, interaction, id_serv, nom_serv, version_serv, nom_modpack, url_modpack, url_installateur, code_couleur, channelID, userID) {
        const channel = client.channels.cache.get(channelID);
        if (channel) {
            channel.send({
                content: `**Voici les informations de votre serveur, <@${interaction.user.id}> !**\n\`\`\`` +
                `Nom du serveur : ${nom_serv}\n` +
                `Version du serveur : ${version_serv}\n` +
                `Nom du modpack : ${nom_modpack}\n` +
                `URL du modpack : ${url_modpack}\n` +
                `URL de l'installateur : ${url_installateur}\n` +
                `Code couleur : ${code_couleur}\n` +
                "```\n"
            });
        } else {
            console.error(`Channel with ID ${channelID} not found.`);
            // On arrête le processus
            process.exit(1);
        }

        // On lance l'installation du serveur sur l'API
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client_token: token_api, id_discord: interaction.user.id, id_serv: id_serv, url_installeur: url_installateur })
        };
        response = await fetch('https://api.antredesloutres.fr/serveurs/installation', requestOptions);
        data = await response.json();
        console.log('[INFO] Installation du serveur ' + '\x1b[33m' + id_serv + ' ' + nom_serv + '\x1b[0m' + ' lancée. Réponse de l\'API : ' + data.status);

        // Maintenant, on va proposer à l'utilisateur de définir des paramètres pour son serveur.properties
        // allow-flight (bool), allow-nether (bool), difficulty (choice), enforce-whitelist (bool), gamemode (choice), hardcore (bool), max-players (int), motd (choice), pvp (bool), spawn-protection (int), level-type (choice), online-mode (bool), resource-pack (string)
        let allow_flight = true;
        let allow_nether = true;
        let difficulty = 'normal';
        let enforce_whitelist = false;
        let gamemode = 'survival';
        let hardcore = false;
        let max_players = 20;
        let motd = 'Un serveur Minecraft';
        let pvp = true;
        let spawn_protection = 16;
        let level_type = 'default';
        let online_mode = true;
        let resource_pack = '';

        function demande_allow_flight() {
            // On déclare les formes d'intéraction
            const button_true = new ButtonBuilder()
                .setCustomId('true')
                .setLabel('Oui')
                .setStyle(ButtonStyle.Primary);
            const button_false = new ButtonBuilder()
                .setCustomId('false')
                .setLabel('Non')
                .setStyle(ButtonStyle.Danger);
    
            // On déclare les actionRow
            const bool_actionRow = new ActionRowBuilder()
                .addComponents(button_true, button_false);
                
            const allow_flight_embed = new EmbedBuilder()
                .setTitle('Autoriser le vol ? (allow_flight)')
                .setDescription('Répondez avec les boutons ci-dessous.')
                .setColor(code_couleur);
        
            channel.send({ embeds: [allow_flight_embed], components: [bool_actionRow] });
        }

        function demande_allow_nether() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => { 
                // On déclare les formes d'intéraction
                const button_true = new ButtonBuilder()
                    .setCustomId('true')
                    .setLabel('Oui')
                    .setStyle(ButtonStyle.Primary);
                const button_false = new ButtonBuilder()
                    .setCustomId('false')
                    .setLabel('Non')
                    .setStyle(ButtonStyle.Danger);
        
                // On déclare les actionRow
                const bool_actionRow = new ActionRowBuilder()
                    .addComponents(button_true, button_false);
                    
                const allow_nether_embed = new EmbedBuilder()
                    .setTitle('Autoriser le Nether ? (allow_nether)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);
            
                channel.send({ embeds: [allow_nether_embed], components: [bool_actionRow] });
            }, 750);
        }

        function demande_difficulty() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction
                const button_peaceful = new ButtonBuilder()
                    .setCustomId('peaceful')
                    .setLabel('Paisible')
                    .setStyle(ButtonStyle.Primary);
                const button_easy = new ButtonBuilder()
                    .setCustomId('Facile')
                    .setLabel('Easy')
                    .setStyle(ButtonStyle.Primary);
                const button_normal = new ButtonBuilder()
                    .setCustomId('Normal')
                    .setLabel('Normal')
                    .setStyle(ButtonStyle.Primary);
                const button_hard = new ButtonBuilder()
                    .setCustomId('Difficile')
                    .setLabel('Hard')
                    .setStyle(ButtonStyle.Primary);
        
                // On déclare les actionRow
                const difficulty_actionRow = new ActionRowBuilder()
                    .addComponents(button_peaceful, button_easy, button_normal, button_hard);
                    
                const difficulty_embed = new EmbedBuilder()
                    .setTitle('Difficulté ? (difficulty)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);
            
                channel.send({ embeds: [difficulty_embed], components: [difficulty_actionRow] });
            }, 750);
        }

        function demande_enforce_whitelist() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction
                const button_true = new ButtonBuilder()
                    .setCustomId('true')
                    .setLabel('Oui')
                    .setStyle(ButtonStyle.Primary);
                const button_false = new ButtonBuilder()
                    .setCustomId('false')
                    .setLabel('Non')
                    .setStyle(ButtonStyle.Danger);
        
                // On déclare les actionRow
                const bool_actionRow = new ActionRowBuilder()
                    .addComponents(button_true, button_false);
                    
                const enforce_whitelist_embed = new EmbedBuilder()
                    .setTitle('Forcer la whitelist ? (enforce_whitelist)')
                    .setDescription('Répondez avec les boutons ci-dessous.\n\nNote : Les joueurs de whitelist ne peuvent être définis que plus tard, via la commande ou en FTB.')
                    .setColor(code_couleur);
            
                channel.send({ embeds: [enforce_whitelist_embed], components: [bool_actionRow] });
            }, 750);
        }

        function demande_gamemode() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction
                const button_survival = new ButtonBuilder()
                    .setCustomId('survival')
                    .setLabel('Survie')
                    .setStyle(ButtonStyle.Primary);
                const button_creative = new ButtonBuilder()
                    .setCustomId('creative')
                    .setLabel('Créatif')
                    .setStyle(ButtonStyle.Primary);
                const button_adventure = new ButtonBuilder()
                    .setCustomId('adventure')
                    .setLabel('Aventure')
                    .setStyle(ButtonStyle.Primary);
                const button_spectator = new ButtonBuilder()
                    .setCustomId('spectator')
                    .setLabel('Spectateur')
                    .setStyle(ButtonStyle.Primary);
        
                // On déclare les actionRow
                const gamemode_actionRow = new ActionRowBuilder()
                    .addComponents(button_survival, button_creative, button_adventure, button_spectator);
                    
                const gamemode_embed = new EmbedBuilder()
                    .setTitle('Mode de jeu ? (gamemode)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);
            
                channel.send({ embeds: [gamemode_embed], components: [gamemode_actionRow] });
            }, 750);
        }

        function demande_hardcore() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction
                const button_true = new ButtonBuilder()
                    .setCustomId('true')
                    .setLabel('Oui')
                    .setStyle(ButtonStyle.Primary);
                const button_false = new ButtonBuilder()
                    .setCustomId('false')
                    .setLabel('Non')
                    .setStyle(ButtonStyle.Danger);
        
                // On déclare les actionRow
                const bool_actionRow = new ActionRowBuilder()
                    .addComponents(button_true, button_false);
                    
                const hardcore_embed = new EmbedBuilder()
                    .setTitle('Mode Hardcore ? (hardcore)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);
            
                channel.send({ embeds: [hardcore_embed], components: [bool_actionRow] });
            }, 750);
        }

        function demande_max_players() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction (2, 10, 20, 40, 1000)
                const button_2 = new ButtonBuilder()
                    .setCustomId('2')
                    .setLabel('2')
                    .setStyle(ButtonStyle.Primary);
                const button_10 = new ButtonBuilder()
                    .setCustomId('10')
                    .setLabel('10')
                    .setStyle(ButtonStyle.Primary);
                const button_20 = new ButtonBuilder()
                    .setCustomId('20')
                    .setLabel('20')
                    .setStyle(ButtonStyle.Primary);
                const button_40 = new ButtonBuilder()
                    .setCustomId('40')
                    .setLabel('40')
                    .setStyle(ButtonStyle.Primary);
                const button_1000 = new ButtonBuilder()
                    .setCustomId('1000')
                    .setLabel('1000')
                    .setStyle(ButtonStyle.Primary);
        
                // On déclare les actionRow
                const max_players_actionRow = new ActionRowBuilder()
                    .addComponents(button_2, button_10, button_20, button_40, button_1000);
                    
                const max_players_embed = new EmbedBuilder()
                    .setTitle('Nombre maximum de joueurs ? (max_players)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);
            
                channel.send({ embeds: [max_players_embed], components: [max_players_actionRow] });
            }, 750);
        }

        function demande_motd() {
            // Inutilisé pour le moment
        }

        function demande_pvp() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction
                const button_true = new ButtonBuilder()
                    .setCustomId('true')
                    .setLabel('Oui')
                    .setStyle(ButtonStyle.Primary);
                const button_false = new ButtonBuilder()
                    .setCustomId('false')
                    .setLabel('Non')
                    .setStyle(ButtonStyle.Danger);
        
                // On déclare les actionRow
                const bool_actionRow = new ActionRowBuilder()
                    .addComponents(button_true, button_false);
                    
                const pvp_embed = new EmbedBuilder()
                    .setTitle('Autorisé le PvP ? (pvp)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);
            
                channel.send({ embeds: [pvp_embed], components: [bool_actionRow] });
            }, 750);
        }

        function demande_spawn_protection() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction (0, 16, 32, 64, 128)
                const button_0 = new ButtonBuilder()
                    .setCustomId('0')
                    .setLabel('0')
                    .setStyle(ButtonStyle.Primary);
                const button_16 = new ButtonBuilder()
                    .setCustomId('16')
                    .setLabel('16')
                    .setStyle(ButtonStyle.Primary);
                const button_32 = new ButtonBuilder()
                    .setCustomId('32')
                    .setLabel('32')
                    .setStyle(ButtonStyle.Primary);
                const button_64 = new ButtonBuilder()
                    .setCustomId('64')
                    .setLabel('64')
                    .setStyle(ButtonStyle.Primary);
                const button_128 = new ButtonBuilder()
                    .setCustomId('128')
                    .setLabel('128')
                    .setStyle(ButtonStyle.Primary);

                // On déclare les actionRow
                const spawn_protection_actionRow = new ActionRowBuilder()
                    .addComponents(button_0, button_16, button_32, button_64, button_128);

                const spawn_protection_embed = new EmbedBuilder()
                    .setTitle('Distance de la protection du spawn ? (spawn_protection)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);

                channel.send({ embeds: [spawn_protection_embed], components: [spawn_protection_actionRow] });
            }, 750);
        }

        function demande_level_type() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction
                const button_default = new ButtonBuilder()
                    .setCustomId('normal')
                    .setLabel('Normal')
                    .setStyle(ButtonStyle.Primary);
                const button_flat = new ButtonBuilder()
                    .setCustomId('flat')
                    .setLabel('Flat')
                    .setStyle(ButtonStyle.Primary);
                const button_large_biomes = new ButtonBuilder()
                    .setCustomId('large_biomes')
                    .setLabel('Large Biomes')
                    .setStyle(ButtonStyle.Primary);
                const button_amplified = new ButtonBuilder()
                    .setCustomId('amplified')
                    .setLabel('Amplified')
                    .setStyle(ButtonStyle.Primary);
                
                // On déclare les actionRow
                const level_type_actionRow = new ActionRowBuilder()
                    .addComponents(button_default, button_flat, button_large_biomes, button_amplified);

                const level_type_embed = new EmbedBuilder()
                    .setTitle('Type de monde ? (level_type)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);

                channel.send({ embeds: [level_type_embed], components: [level_type_actionRow] });
            }, 750);
        }

        function demande_online_mode() {
            // D'abort on supprime la question précédente
            channel.bulkDelete(1);
            // On attend 1/2 seconde
            setTimeout(() => {
                // On déclare les formes d'intéraction
                const button_true = new ButtonBuilder()
                    .setCustomId('true')
                    .setLabel('Oui')
                    .setStyle(ButtonStyle.Primary);
                const button_false = new ButtonBuilder()
                    .setCustomId('false')
                    .setLabel('Non')
                    .setStyle(ButtonStyle.Danger);

                // On déclare les actionRow
                const bool_actionRow = new ActionRowBuilder()
                    .addComponents(button_true, button_false);

                const online_mode_embed = new EmbedBuilder()
                    .setTitle('Vérifier les comptes premium ? (online_mode)')
                    .setDescription('Répondez avec les boutons ci-dessous.')
                    .setColor(code_couleur);

                channel.send({ embeds: [online_mode_embed], components: [bool_actionRow] });
            }, 750);
        }

        function demande_resource_pack() {
            // Inutilisé pour le moment
        }

        // On pose la première question
        demande_allow_flight();

        // On écoute les réponses
        const filter = i => i.user.id === interaction.user.id;
        const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
        collector.on('collect', async i => {
            if (i.customId === 'true') {
                allow_flight = true;
            } else if (i.customId === 'false') {
                allow_flight = false;
            }
            collector.stop();
            i.deferUpdate();
        });

        collector.on('end', async collected => {
            // On pose la deuxième question et supprime celle d'avant
            demande_allow_nether();

            // On écoute les réponses
            const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
            collector.on('collect', async i => {
                if (i.customId === 'true') {
                    allow_nether = true;
                } else if (i.customId === 'false') {
                    allow_nether = false;
                }
                collector.stop();
                i.deferUpdate();
            });

            collector.on('end', async collected => {
                // On pose la troisième question et supprime celle d'avant
                demande_difficulty();

                // On écoute les réponses
                const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                collector.on('collect', async i => {
                    if (i.customId === 'peaceful') {
                        difficulty = 'peaceful';
                    } else if (i.customId === 'easy') {
                        difficulty = 'easy';
                    } else if (i.customId === 'normal') {
                        difficulty = 'normal';
                    } else if (i.customId === 'hard') {
                        difficulty = 'hard';
                    }
                    collector.stop();
                    i.deferUpdate();
                });

                collector.on('end', async collected => {
                    // On pose la quatrième question et supprime celle d'avant
                    demande_enforce_whitelist();

                    // On écoute les réponses
                    const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                    collector.on('collect', async i => {
                        if (i.customId === 'true') {
                            enforce_whitelist = true;
                        } else if (i.customId === 'false') {
                            enforce_whitelist = false;
                        }
                        collector.stop();
                        i.deferUpdate();
                    });

                    collector.on('end', async collected => {
                        // On pose la cinquième question et supprime celle d'avant
                        demande_gamemode();

                        // On écoute les réponses
                        const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                        collector.on('collect', async i => {
                            if (i.customId === 'survival') {
                                gamemode = 'survival';
                            } else if (i.customId === 'creative') {
                                gamemode = 'creative';
                            } else if (i.customId === 'adventure') {
                                gamemode = 'adventure';
                            } else if (i.customId === 'spectator') {
                                gamemode = 'spectator';
                            }
                            collector.stop();
                            i.deferUpdate();
                        });

                        collector.on('end', async collected => {
                            // On pose la sixième question et supprime celle d'avant
                            demande_hardcore();

                            // On écoute les réponses
                            const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                            collector.on('collect', async i => {
                                if (i.customId === 'true') {
                                    hardcore = true;
                                } else if (i.customId === 'false') {
                                    hardcore = false;
                                }
                                collector.stop();
                                i.deferUpdate();
                            });

                            collector.on('end', async collected => {
                                // On pose la septième question et supprime celle d'avant
                                demande_max_players();

                                // On écoute les réponses
                                const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                                collector.on('collect', async i => {
                                    max_players = parseInt(i.customId);
                                    collector.stop();
                                    i.deferUpdate();
                                });

                                collector.on('end', async collected => {
                                    // On pose la huitième question et supprime celle d'avant
                                    demande_pvp();

                                    // On écoute les réponses
                                    const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                                    collector.on('collect', async i => {
                                        if (i.customId === 'true') {
                                            pvp = true;
                                        } else if (i.customId === 'false') {
                                            pvp = false;
                                        }
                                        collector.stop();
                                        i.deferUpdate();
                                    });

                                    collector.on('end', async collected => {
                                        // On pose la neuvième question et supprime celle d'avant
                                        demande_spawn_protection();

                                        // On écoute les réponses
                                        const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                                        collector.on('collect', async i => {
                                            spawn_protection = parseInt(i.customId);
                                            collector.stop();
                                            i.deferUpdate();
                                        });

                                        collector.on('end', async collected => {
                                            // On pose la dixième question et supprime celle d'avant
                                            demande_level_type();

                                            // On écoute les réponses
                                            const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                                            collector.on('collect', async i => {
                                                if (i.customId === 'normal') {
                                                    level_type = 'normal';
                                                } else if (i.customId === 'flat') {
                                                    level_type = 'flat';
                                                } else if (i.customId === 'large_biomes') {
                                                    level_type = 'large_biomes';
                                                } else if (i.customId === 'amplified') {
                                                    level_type = 'amplified';
                                                }
                                                collector.stop();
                                                i.deferUpdate();
                                            });

                                            collector.on('end', async collected => {
                                                // On pose la onzième question et supprime celle d'avant
                                                demande_online_mode();

                                                // On écoute les réponses
                                                const collector = channel.createMessageComponentCollector({ filter, time: 60000 });
                                                collector.on('collect', async i => {
                                                    if (i.customId === 'true') {
                                                        online_mode = true;
                                                    } else if (i.customId === 'false') {
                                                        online_mode = false;
                                                    }
                                                    collector.stop();
                                                    i.deferUpdate();
                                                });

                                                collector.on('end', async collected => {
                                                    // On supprime la dernière question
                                                    channel.bulkDelete(1);
                                                    // On attend 1/2 seconde
                                                    setTimeout(() => {
                                                        channel.send({
                                                            content: `**Voici les paramètres de votre serveur, <@${interaction.user.id}> !**\n\`\`\`` +
                                                            `allow-flight : ${allow_flight}\n` +
                                                            `allow-nether : ${allow_nether}\n` +
                                                            `difficulty : ${difficulty}\n` +
                                                            `enforce-whitelist : ${enforce_whitelist}\n` +
                                                            `gamemode : ${gamemode}\n` +
                                                            `hardcore : ${hardcore}\n` +
                                                            `max-players : ${max_players}\n` +
                                                            `pvp : ${pvp}\n` +
                                                            `spawn-protection : ${spawn_protection}\n` +
                                                            `level-type : ${level_type}\n` +
                                                            `online-mode : ${online_mode}\n` +
                                                            "```\n"
                                                        });
                                                    });

                                                    // On lance la création du serveur sur l'API
                                                    const requestOptions = {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ client_token: token_api, id_serv: id_serv, nom_serv: nom_serv, id_discord: interaction.user.id, allow_flight: allow_flight, allow_nether: allow_nether, difficulty: difficulty, enforce_whitelist: enforce_whitelist, gamemode: gamemode, hardcore: hardcore, max_players: max_players, pvp: pvp, spawn_protection: spawn_protection, level_type: level_type, online_mode: online_mode })
                                                    }; 

                                                    try {
                                                        response = await fetch('https://api.antredesloutres.fr/serveurs/properties', requestOptions);
                                                        data = await response.json();
                                                        console.log('[INFO] Propriétés du serveur ' + '\x1b[33m' + id_serv + ' ' + nom_serv + '\x1b[0m' + ' envoyé. Réponse de l\'API : ' + data.status);
                                                        
                                                        if (data.message) {
                                                            console.log('[INFO] Message de l\'API : ' + data.message);
                                                        } else if (data.error) {
                                                            console.error('[ERROR] Erreur de l\'API : ' + data.error + '. Champ(s) manquants : ' + data.missingFields);
                                                        }
                                                        
                                                    } catch (error) {
                                                        console.error('[ERROR] Erreur lors de l\'envoi sur l\'API des propriétés du serveur ' + '\x1b[33m' + id_serv + ' ' + nom_serv + '\x1b[31m' + ' : ' + error);
                                                        console.error('[ERROR] Réponse de l\'API : ' + data.error);
                                                    }

                                                    // On attend 5 minutes avant de supprimer le salon
                                                    channel.send('Configuration terminée ! Le salon sera supprimé dans 5 minutes.')
                                                    setTimeout(() => {
                                                        channel.delete();
                                                    }, 300000);
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    },

    async update_server_properties(client, interaction, id_serv, nom_serv, code_couleur, channelID) {},

    async delete_server(client, interaction, id_serv, channelID) {}
}
