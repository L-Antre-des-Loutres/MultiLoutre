import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, TextChannel } from "discord.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import otterlogs from "../utils/otterlogs";

const STORE_FILE = path.resolve(__dirname, "./data/sentGames.json");
const CHANNEL_ID = process.env.BOT_ADMIN || "";
// const CHECK_INTERVAL = 10000; // 10 seconds
const CHECK_INTERVAL = process.env.TASK_INTERVAL ? Number(process.env.TASK_INTERVAL) : 86400000; // 24 heures
const BOT_COLOR = process.env.BOT_COLOR || "#d1930d";

interface Game {
  id: string;
  title: string;
  description?: string;
  image?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  originalprice?: string;
}

async function getFreeGames(): Promise<Game[]> {
  const url =
    "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=fr-FR&country=FR&allowCountries=FR";
  try {
    const response = await axios.get(url);
    const data = response.data as any;
    const games = data.data.Catalog.searchStore.elements;

    const freeGames = games.filter((game: any) => {
      const notMystery = !game.title.includes("Mystery Game");
      const priceInfo = game.price?.totalPrice;
      const hasOffer =
        game.promotions?.promotionalOffers?.length > 0 ||
        game.promotions?.upcomingPromotionalOffers?.length > 0;
      return priceInfo?.discountPrice === 0 && hasOffer && notMystery;
    });

    return freeGames.map((game: any) => {
        const title = game.title;
        const id = game.id;
        const description = game.description || "Pas de description disponible.";
        const image =
            game.keyImages?.find((img: any) => img.type === "OfferImageWide")?.url ||
            game.keyImages?.[0]?.url ||
            "";
        const slug =
            game.catalogNs?.mappings?.[0]?.pageSlug || game.productSlug;
        const url = slug
            ? `https://store.epicgames.com/fr/p/${slug}`
            : "https://store.epicgames.com/fr/";

        // Dates de promotion
        const promo = game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0];
        const startDate = promo?.startDate || "";
        const endDate = promo?.endDate || "";
        const originalprice = game.price?.totalPrice?.fmtPrice?.originalPrice || "Inconnu";

        return { id, title, description, image, url, startDate, endDate, originalprice };
        });
  } catch (error) {
    otterlogs.error(`Erreur lors de la récupération des jeux gratuits : ${error}`);
    return [];
  }
}

function loadSentGames(): Set<string> {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf8");
      return new Set(JSON.parse(data));
    }
  } catch (err) {
    otterlogs.error(`Impossible de lire le fichier sentGames.json : ${err}`);
  }
  return new Set();
}

function saveSentGames(sentGames: Set<string>) {
  try {
    const arr = Array.from(sentGames);
    fs.mkdirSync(path.dirname(STORE_FILE), { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(arr, null, 2));
  } catch (err) {
    otterlogs.error(`Impossible de sauver sentGames.json : ${err}`);
  }
}

export async function task(client: Client, guildId: string) {
  const sentGames = loadSentGames();

  setInterval(async () => {
    otterlogs.log("Vérification des nouveaux jeux gratuits...");
    const games = await getFreeGames();
    const newGames = games.filter((game) => !sentGames.has(game.id));

    if (newGames.length > 0) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        otterlogs.error(`Guild avec ID ${guildId} introuvable.`);
        return;
      }
      const channel = guild.channels.cache.get(CHANNEL_ID) as TextChannel;
      if (!channel) {
        otterlogs.error(`Channel avec ID ${CHANNEL_ID} introuvable.`);
        return;
      }

      for (const game of newGames) {
        const formatDate = (isoDate: string) => {
            return new Date(isoDate).toLocaleString("fr-FR", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Europe/Paris",
            });
        };

        let GameDescription = game.title + " est gratuit sur l'Epic Games Store !\n\n";
        if (game.description != game.title) {
            GameDescription += GameDescription.substring(0, 2000) + "...\n\n";
        }
        GameDescription += `Offre disponible du **${game.startDate ? formatDate(game.startDate) : "Inconnue"}** au **${game.endDate ? formatDate(game.endDate) : "Inconnue"}**`
        if (game.originalprice && Number(game.originalprice) > 0) {
            GameDescription += `\n\n**Prix original :** ${game.originalprice}`;
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(`send_with_ping_${game.id}`)
            .setLabel("Envoyé avec ping")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`send_without_ping_${game.id}`)
            .setLabel("Envoyé sans ping")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`cancel_${game.id}`)
            .setLabel("Ne pas envoyer")
            .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            embeds: [
                {
                title: game.title,
                description: GameDescription,
                url: game.url,
                image: { url: game.image || "" },
                color: parseInt(BOT_COLOR.replace(/^#/, ""), 16)
                },
            ],
            components: [row],
        });
        sentGames.add(game.id);
      }
      saveSentGames(sentGames);
      otterlogs.success(`${newGames.length} nouveau(x) jeu(x) annoncé(s).`);
    } else {
      otterlogs.log("Aucun nouveau jeu gratuit détecté.");
    }
  }, CHECK_INTERVAL);

  otterlogs.success("Tâche de vérification des jeux gratuits commencé.");
}
