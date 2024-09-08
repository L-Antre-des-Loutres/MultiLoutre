const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const { maxServeurParUtilisateur, token_api } = require('../../config.json');
serverManagmentEvent = require('../../events/server_managment.js');

// créer serveur [nom_serv] [version_serv] [nom_modpack] [url_modpack] [url_installateur] (code_couleur)
module.exports = {
    data: new SlashCommandBuilder()
        .setName('creer-serveur')
        .setDescription('Permet aux investisseurs de créer un serveur Minecraft.')
        .addStringOption(option => option.setName('nom_serv').setDescription('Nom du serveur').setRequired(true))
        .addStringOption(option => option.setName('version_serv').setDescription('Version du serveur').setRequired(true))
        .addStringOption(option => option.setName('nom_modpack').setDescription('Nom du modpack').setRequired(true))
        .addStringOption(option => option.setName('url_modpack').setDescription('URL du modpack').setRequired(true))
        .addStringOption(option => option.setName('url_installateur').setDescription('URL de l\'installateur').setRequired(true))
        .addStringOption(option => option.setName('code_couleur').setDescription('Code couleur du serveur').setRequired(false)),
    async execute(interaction) {
        console.warn('[WARN] ' + '\x1b[33m' + 'L\'utilisateur ' + '\x1b[34m' + interaction.user.tag + '\x1b[33m' + ' fait une demande de création de serveur. Démarrage du processus...');
        
        // Vérification des données
        // "nom_serv" doit être une chaîne de caractères de 3 à 20 caractères, sans caractères spéciaux ni espaces
        const nom_serv = interaction.options.getString('nom_serv');
        if (nom_serv.length < 3 || nom_serv.length > 20 || !/^[a-zA-Z0-9]*$/.test(nom_serv) || nom_serv.includes(' ')) {
            console.warn('[WARN] Nom du serveur invalide. Annulation de la création du serveur.');
            return await interaction.reply({ content: 'Le nom du serveur doit contenir entre 3 et 20 caractères alphanumériques, donc sans caractères spéciaux ni espaces 🥸', ephemeral: true });
        }
        console.log('[INFO] Nom du serveur valide : ' + nom_serv);

        // "version_serv" doit être une version de Minecraft valide et commencer par "1." et avoir maximum que 2 sous-version.
        const version_serv = interaction.options.getString('version_serv');
        if (!/^1\.[0-9]{1,2}$/.test(version_serv)) {
            console.warn('[WARN] Version du serveur invalide. Annulation de la création du serveur.');
            return await interaction.reply({ content: 'La version du serveur doit être une version de Minecraft valide (ex : 1.16) 🥸', ephemeral: true })
        };
        console.log('[INFO] Version du serveur valide : ' + version_serv);

        // "nom_modpack" doit être une chaîne de caractères de 3 à 20 caractères, sans caractères spéciaux, espaces autorisés.
        const nom_modpack = interaction.options.getString('nom_modpack');
        if (nom_modpack.length < 3 || nom_modpack.length > 20 || !/^[a-zA-Z0-9 ]*$/.test(nom_modpack)) {
            console.warn('[WARN] Nom du modpack invalide. Annulation de la création du serveur.');
            return await interaction.reply({ content: 'Le nom du modpack doit contenir entre 3 et 20 caractères alphanumériques, donc sans caractères spéciaux 🥸', ephemeral: true });
        }
        console.log('[INFO] Nom du modpack valide : ' + nom_modpack);

        // "url_modpack" doit être une URL valide
        const url_modpack = interaction.options.getString('url_modpack');
        if (!/^(http|https):\/\/[^ "]+$/.test(url_modpack)) {
            console.warn('[WARN] URL du modpack invalide. Annulation de la création du serveur.');
            return await interaction.reply({ content: 'L\'URL du modpack doit être une URL valide 🥸', ephemeral: true });
        }
        console.log('[INFO] URL du modpack valide : ' + url_modpack);

        // "url_installateur" doit être une URL valide
        const url_installateur = interaction.options.getString('url_installateur');
        if (!/^(http|https):\/\/[^ "]+$/.test(url_installateur)) {
            console.warn('[WARN] URL de l\'installateur invalide. Annulation de la création du serveur.');
            return await interaction.reply({ content: 'L\'URL de l\'installateur doit être une URL valide 🥸', ephemeral: true });
        }
        console.log('[INFO] URL de l\'installateur valide : ' + url_installateur);

        // "code_couleur" doit être une couleur hexadécimale valide
        let code_couleur = '';
        if (interaction.options.getString('code_couleur')) {
            code_couleur = interaction.options.getString('code_couleur');
            if (!/^#[0-9A-F]{6}$/i.test(code_couleur)) {
                console.warn('[WARN] Code couleur invalide. Annulation de la création du serveur.');
                // Pour le fun, on génère une couleur aléatoire si le code couleur est invalide
                random_color = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                return await interaction.reply({ content: 'Le code couleur doit être une couleur hexadécimale valide (ex : [' + random_color + '](https://www.hexcolortool.com/' + random_color + ')) 🥸', ephemeral: true });
            }
            console.log('[INFO] Code couleur valide : ' + code_couleur);
        } else {
            // Pour le fun, on génère une couleur aléatoire si le code couleur n'est pas défini
            code_couleur = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            console.log('[INFO] Code couleur aléatoire : ' + code_couleur);
        }
        
        // Maintenant on vérifie que l'utilisateur n'a pas déjà un serveur avec l'api Antre des loutres "https://api.antredesloutres.fr/investisseurs/${interaction.user.id}"
        try {
            const response = await fetch(`https://api.antredesloutres.fr/investisseurs/`);
            const data = await response.json();
        
            const userServers = data[interaction.user.id];    
            console.log('[INFO] Serveur(s) de l\'utilisateur : ' + interaction.user.id + ' :', userServers);
        
            // Vérifier si l'utilisateur a atteint le nombre maximum de serveurs.
            if (userServers && userServers.length >= maxServeurParUtilisateur) {
                console.warn('[WARN] L\'utilisateur a déjà atteint le nombre maximum de serveurs. Lancement de l\'event "too_much_servers"');
                serverManagmentEvent.too_much_servers(interaction.client, interaction, interaction.channel.id, interaction.user.id);
                return // await interaction.channel.send({ content: 'Vous avez déjà atteint le nombre maximum de serveurs que vous pouvez posséder en même temps, qui est de ' + maxServeurParUtilisateur + ' 🥸'});
            }
        } catch (error) {
            console.error('[ERROR] ' + error);
            return await interaction.reply({ content: 'Une erreur est survenue lors de la vérification de vos serveurs. Veuillez réessayer plus tard 🥸', ephemeral: true });
        }

        // On récupère la liste des investisseurs pour vérifier que l'utilisateur y est inscrit. Si ce n'est pas le cas, on l'ajoute.
        try {
            let response = await fetch('https://api.antredesloutres.fr/investisseurs/');
            let data = await response.json();
            if (!data[interaction.user.id]) {
                console.warn('[WARN] L\'utilisateur n\'est pas inscrit en tant qu\'investisseur. Ajout de celui-ci...');
                // On ajoute l'utilisateur à la liste des investisseurs avec une requête POST : id_discord, id_serveur, client_token
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_discord: interaction.user.id, client_token: token_api })
                };
                let response = await fetch('https://api.antredesloutres.fr/investisseurs/add', requestOptions);
                let data = await response.json();
                console.log('[INFO] Utilisateur ajouté en tant qu\'investisseur :', data);

                // Si l'API renvoi : "status: false", on renvoi un message d'erreur
                if (!data.status) {
                    console.error('[ERROR] Une erreur est survenu avec l\'API : ' + data.message);
                    return await interaction.reply({ content: 'Une erreur est survenue avec l\'API. Veuillez réessayer plus tard 🥸', ephemeral: true });
                }
            }
        } catch (error) {
            console.error('[ERROR] ' + error);
            return await interaction.reply({ content: 'Une erreur est survenue lors de la vérification des investisseur. Veuillez réessayer plus tard 🥸', ephemeral: true });
        }

        // Maintenant on ajoute le serveur à la liste des serveurs de l'utilisateur. On vérifie aussi si le nom du serveur n'est pas déjà utilisé.
        const path_serv = "/home/serveurs/minecraft/serveurs-investisseurs/" + interaction.user.id + "/" + nom_serv + "/";
        let id_serv; // On déclare la variable id_serv pour récupérer l'id du serveur quand on l'aura ajouté
        try {
            response = await fetch('https://api.antredesloutres.fr/serveurs/');
            data = await response.json();
            for (let id in data) {
                if (data[id].nom_serv === nom_serv) {
                    console.warn('[WARN] Le nom du serveur est déjà utilisé. Annulation de la création du serveur.');
                    return await interaction.reply({ content: 'Le nom du serveur est déjà utilisé par un autre serveur 🥸', ephemeral: true });
                }
            }

            // On ajoute le serveur à la liste des serveurs : client_token, jeu, nom_serv, modpack, modpack_url, embedColor, version_serv, path_serv, administrateur
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ client_token: token_api, jeu: 'Minecraft', nom_serv: nom_serv, modpack: nom_modpack, modpack_url: url_modpack, embedColor: code_couleur, version_serv: version_serv, path_serv: path_serv, administrateur: interaction.user.id })
            };
            response = await fetch('https://api.antredesloutres.fr/serveurs/add', requestOptions);
            data = await response.json();
            id_serv = data.id_serv;
            console.log('[INFO] Serveur ajouté : ' + '\x1b[33m' + id_serv + ' ' + nom_serv + '\x1b[0m' + '.');

            // Si l'API renvoi : "status: false", on renvoi un message d'erreur
            if (!data.status) {
                console.error('[ERROR] Une erreur est survenu avec l\'API : ' + data.message);
                return await interaction.reply({ content: 'Une erreur est survenue avec l\'API. Veuillez réessayer plus tard 🥸', ephemeral: true });
            }
        } catch (error) {
            console.error('[ERROR] ' + error);
            return await interaction.reply({ content: 'Une erreur est survenue lors de l\'ajout du serveur. Veuillez réessayer plus tard 🥸', ephemeral: true });
        }

        // Maintenant on ajoute le serveur à la liste des serveurs de l'utilisateur
        try {
            // On met à jour la liste des serveurs de l'utilisateur : client_token, id_discord, id_serveur
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_token: token_api, id_discord: interaction.user.id, id_serv: id_serv })
            };
            response = await fetch('https://api.antredesloutres.fr/investisseurs/serveur/addServeur', requestOptions);
            data = await response.json();
            console.log('[INFO] Liste des serveurs de l\'utilisateur mise à jour :', data);

            // Si l'API renvoi : "status: false", on renvoi un message d'erreur
            if (!data.status) {
                console.error('[ERROR] Une erreur est survenu avec l\'API : ' + data.message);
                return await interaction.reply({ content: 'Une erreur est survenue avec l\'API. Veuillez réessayer plus tard 🥸', ephemeral: true });
            }
        } catch (error) {
            console.error('[ERROR] ' + error);
            return await interaction.reply({ content: 'Une erreur est survenue lors de la mise à jour de la liste des serveurs de l\'utilisateur. Veuillez réessayer plus tard 🥸', ephemeral: true });
        }

        // On créer un salon textuel temporaire pour configurer le serveur. Met le salon dans la catégorie "Gestion des serveurs"
        let channel;
        try {
            const guild = interaction.guild;
            const categorie = guild.channels.cache.find(channel => channel.name === 'Gestion des serveurs');
            channel = await guild.channels.create({
                name: nom_serv,
                type: ChannelType.GuildText,
                parent: categorie.id,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel],
                    },
                ],
            });
            console.warn(`[WARN] Salon "${nom_serv}" créé !`);
        } catch (error) { 
            console.error('[ERROR] ' + error);
            return await interaction.reply({ content: 'Une erreur est survenue lors de la création du salon. Veuillez réessayer plus tard 🥸', ephemeral: true });
        }

        // On lance l'évènement ../events/serverCreate.js et on envoi un message récapitulatif dans le salon créé
        try {
            serverManagmentEvent.install_server(interaction.client, id_serv, nom_serv, version_serv, nom_modpack, url_modpack, url_installateur, code_couleur, channel.id, interaction.user.id);
        } catch (error) {
            console.error('[ERROR] Erreur lors du lancement de l\'event "serverCreate.js" : ' + error);
        }

        // On envoi un message à l'utilisateur quand même
        let username;
        if (interaction.user.id === "383676607434457088") {
            username = "RenardRouge"; // Surnom de Rerebleue
        } else if (interaction.user.id === "518780404057112580") {
            username = 'du mastodonte'; // Surnom de TheAzertor
        } else if (interaction.user.id === "556501819468152832") {
            username = '"Laur-Vallat"'; // Surnom d'Ashura
        } else if (interaction.user.id === "811691274691674142") {
            username = "Badabouche"; // SUrnom de Babouche
        } else if (interaction.user.id === "1112779900470960251") {
            username = "la copine de Mathéo"; // Surnom du double compte de Rerebleue
        } else if (interaction.member.nickname === null) {
            username = interaction.user.username;
        } else {
            username = interaction.member.nickname;
        }
        const embed = new EmbedBuilder()
        .setTitle(`Serveur de ${username} crée avec succès !`)
        .setURL("https://antredesloutres.fr/serveurs")
        .setDescription(
            `Youhouuuu !\nFélicitations, votre serveur ${nom_serv} a bien été créé ! 🎉\n\n` +
            `Rendez-vous sur le salon <#${channel.id}> pour le configurer !`
        )
        // On rétrécit l'image pour qu'elle ne prenne pas toute la largeur de l'embed
        .setThumbnail(interaction.user.displayAvatarURL({ size: 64 }))
        .setColor("#9adeba")
        .setFooter({
          text: "Mineotter",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    },
};
