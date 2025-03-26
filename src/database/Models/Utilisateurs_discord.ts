import { I_Utilisateurs_discord } from "../../types";
import { Database } from "../controller";
import otterlogs from "../../utils/otterlogs";

export class UtilisateursDiscord implements I_Utilisateurs_discord {
    discord_id!: string;
    pseudo_discord!: string;
    join_date_discord!: string;

    constructor(discord_id: string, pseudo_discord: string, join_date_discord: string) {
        this.discord_id = discord_id;
        this.pseudo_discord = pseudo_discord;
        this.join_date_discord = join_date_discord;
    }

    static getTableName(): string {
        return "utilisateurs_discord";
    }

    static async getAll() {
        // Récupérer tous les utilisateurs
        const db = new Database();

        // Vérifie si le membre est déjà enregistré
        try {
            const utilisateursDiscord = await db.select(UtilisateursDiscord.getTableName(), []);
            return utilisateursDiscord;
        } catch (error) {
            otterlogs.error('Erreur lors de la récupération des utilisateurs : ', error);
        }
    }

    static async getByDiscordId(discord_id: string) {
        // Récupérer un utilisateur par son ID Discord
        const db = new Database();

        // Vérifie si le membre est déjà enregistré
        try {
            const utilisateursDiscord = await db.select(UtilisateursDiscord.getTableName(), [{ discord_id }]);
            return utilisateursDiscord;
        } catch (error) {
            otterlogs.error('Erreur lors de la récupération de l\'utilisateur : ', error);
        }
    }

}

export default UtilisateursDiscord;
