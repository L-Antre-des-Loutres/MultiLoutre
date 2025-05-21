import {
  Events,
  Interaction,
  ButtonInteraction,
  TextChannel,
} from "discord.js";
import otterlogs from "../utils/otterlogs";

interface FreeGameTaskInteraction {
    name: typeof Events.InteractionCreate;
    once: boolean;
    execute: (interaction: Interaction) => Promise<void>;
}

interface EmbedData {
    title: string;
    description: string;
    url: string;
    image?: { url: string };
    color: number;
}

export default {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction: Interaction): Promise<void> => {
        const CHANNEL_ID: string = process.env.BOT_ADMIN || "";
        const PING_ID: string = process.env.PING_JEUX_ID || "";
        const BOT_COLOR = process.env.BOT_COLOR || "#d1930d";

        if (!interaction.isButton()) return;

        const [action, type, gameId]: string[] = interaction.customId.split("_");

        if (
            !["send", "cancel"].includes(action) ||
            (!["with", "without"].includes(type) && action !== "cancel")
        )
            return;

        const message = interaction.message;
        const embed = message.embeds[0];

        if (!embed) {
            otterlogs.error("Embed non trouvé dans le message de l'interaction.");
            return;
        }

        const title: string = embed.title || "Jeu gratuit";
        const description: string = embed.description || "";
        const image: string | undefined = embed.image?.url;
        const url: string = embed.url || "";

        const guild = interaction.guild;
        if (!guild) {
            otterlogs.error("Guild introuvable pour l'interaction.");
            return;
        }

        const channel = guild.channels.cache.get(CHANNEL_ID) as TextChannel | undefined;
        if (!channel) {
            otterlogs.error(`Channel avec ID ${CHANNEL_ID} introuvable.`);
            return;
        }

        // Annuler
        if (action === "cancel") {
            await interaction.update({
                content: `L'envoi de **${title}** a été annulé.`,
                embeds: [],
                components: [],
            });
            return;
        }

        // Envoyer avec ou sans ping
        const ping: string = type === "with" ? `<@&${PING_ID}>` : "";

        const embedData: EmbedData = {
            title,
            description,
            url,
            ...(image ? { image: { url: image } } : {}),
            color: parseInt(BOT_COLOR.replace(/^#/, ""), 16),
        };

        await channel.send({
            content: ping,
            embeds: [embedData],
        });

        await interaction.update({
            content: `**${title}** a été envoyé dans <#${CHANNEL_ID}> ${ping ? "avec ping." : "sans ping."}`,
            embeds: [],
            components: [],
        });
    },
} as FreeGameTaskInteraction;