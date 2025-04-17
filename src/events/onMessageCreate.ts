import { Events, Message } from "discord.js";
import { ServeurParametersController } from "../database/serveursParametersController";
import { Rcon } from "rcon-client";
import otterlogs from "../utils/otterlogs";
import { Serveur, ServeursDatabase } from "../database/serveursController";
import axios from 'axios';
import { cp } from "fs";

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    if (message.author.bot) return; // Ignore les messages des bots

    const messageContent = message.content.toLowerCase();
    if (messageContent.includes("multiloutre")) {
      message.react("🦦");
    }

    if (message.channelId === process.env.DISCU_MC || message.channelId === process.env.DISCU_MC_PARTENAIRE) {
      otterlogs.log(`Message reçu dans le salon ${message.channelId} par ${message.author.tag} (${message.author.id})`);

      const author_name = escapeMinecraftJson(message.author.username);
      const discord_message = escapeMinecraftJson(replaceEmojis(message.content));
      let message_to_send = `tellraw @a ["",{"text":"<${author_name}>","color":"#7289DA"},{"text":" ${discord_message}"}]`;

      const serverParameters = new ServeurParametersController();
      const serveur = new ServeursDatabase();

      switch (message.channelId) {
        case process.env.DISCU_MC:
          if (process.env.ENABLE_PRIMARY_SERVER_RCON && process.env.ENABLE_PRIMARY_SERVER_RCON === "true") {
            const rcon_primaire = new Rcon({
              host: "194.164.76.165", // "??" gère le cas où la valeur est null en remplaçant par une chaîne vide
              port: 25575,
              password: await serverParameters.getRconPassword() ?? "",
            });
            // otterlogs.log(`RCON : ${rcon_primaire.config.host} ${rcon_primaire.config.port} ${rcon_primaire.config.password}`);
            try {
              // Envoi au premier serveur
              await (rcon_primaire).connect();
              await (rcon_primaire).send(message_to_send);
              await (rcon_primaire).end();
            } catch (error) {
              otterlogs.error(`Failed to send message to primary server : ${error}`);
            }
          }

          if (process.env.ENABLE_SECONDARY_SERVER_RCON && process.env.ENABLE_SECONDARY_SERVER_RCON === "true") {
            // otterlogs.log(`RCON : ${rcon_secondaire.config.host} ${rcon_secondaire.config.port} ${rcon_secondaire.config.password}`);
            let serveurSecondaire: Serveur;

            const serveurSecondaireId = await serverParameters.getSecondaryServeurId();
            if (serveurSecondaireId !== null) {
              const result = await serveur.getServeurById(serveurSecondaireId);
              if (result.results.length > 0) {
                serveurSecondaire = result.results[0];
              } else {
                otterlogs.error("Impossible de récupérer le serveur secondaire.");
                return;
              }
            } else {
              otterlogs.error("Impossible de récupérer l'ID du serveur secondaire.");
              return;
            }

            if (serveurSecondaire.jeu == "Palworld") {
              try {

                // Envoi un messsage sur le serveur palworld
                const message_to_send = message.member?.user.displayName + " : " + message.content;

                let data = JSON.stringify({
                  "message": message_to_send,
                });

                let config = {
                  method: 'post',
                  maxBodyLength: Infinity,
                  url: 'http://127.0.0.1:8212/v1/api/announce',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic YWRtaW46VWplenVnNzU='
                  },
                  data: data
                };

                axios(config)
                  .then((response) => {
                    // console.log(JSON.stringify(response.data));
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              } catch (error) {
                otterlogs.error(`Failed to send message to secondary server : ${error}`);
              }
            } else if (serveurSecondaire.jeu == "Minecraft") {
              const rcon_secondaire = new Rcon({
                host: (await serverParameters.getSecondaryServeurHost()) ?? "",
                port: 25574,
                password: await serverParameters.getRconPassword() ?? "",
              });

              try {
                // Envoi au deuxième serveur
                await (rcon_secondaire).connect();
                await (rcon_secondaire).send(message_to_send);
                await (rcon_secondaire).end();
              }
              catch (error) {
                otterlogs.error(`Failed to send message to secondary server : ${error}`);
              }
            } else {
              otterlogs.error(`Le serveur secondaire n'est pas un serveur Minecraft ou Palworld...`);
            }
            break;
          }
        
        case process.env.DISCU_MC_PARTENAIRE:
          if (process.env.ENABLE_PARTENAIRE_SERVER_RCON && process.env.ENABLE_PARTENAIRE_SERVER_RCON === "true") {
            const rcon_partenaire = new Rcon({
              host: (await serverParameters.getPartenaireServeurHost()) ?? "",
              port: 25580,
              password: await serverParameters.getPartenaireRconPassword() ?? "",
            });
            // otterlogs.log(`RCON : ${rcon_partenaire.config.host} ${rcon_partenaire.config.port} ${rcon_partenaire.config.password}`);
        
            try {
              // Envoi au deuxième serveur
              await (rcon_partenaire).connect();
              await (rcon_partenaire).send(message_to_send);
              await (rcon_partenaire).end();
            } catch (error) {
              otterlogs.error(`Failed to send message to secondary server : ${error}`);
            }
          }
        break;
        default:
          otterlogs.error(`Le salon ${message.channelId} n'est pas configuré pour envoyer des messages au serveur Minecraft... Cette situation ne devrait pas pouvoir arriver !`);
        break;
      }
    }
  },
};

function escapeMinecraftJson(text: string) {
  return text
    .replace(/\\/g, '\\\\') // Échappe les antislashs
    .replace(/"/g, '\\"')   // Échappe les guillemets doubles
    .replace(/\n/g, '\\n')  // Échappe les sauts de ligne
    .replace(/\r/g, '')     // Supprime les retours chariots inutiles
    .replace(/\t/g, '\\t'); // Échappe les tabulations
}

function replaceEmojis(text: string): string {
  // Remplace les emojis Discord par un emoji générique
  let no_emoji_text = text.replace(/<:([a-zA-Z0-9_]+):[0-9]+>/g, (match, p1) => '🦦');
  no_emoji_text = no_emoji_text.replace(/<a:([a-zA-Z0-9_]+):[0-9]+>/g, (match, p1) => '🦦');
  // Renvoyer le texte avec les emojis remplacés
  return no_emoji_text;
}