import { Client, TextChannel } from "discord.js";

const logStyles = {
  success: "\u001b[32m[success]\u001b[0m",
  info: "\u001b[34m[info]\u001b[0m",
  warn: "\u001b[33m[warn]\u001b[0m",
  error: "\u001b[31m[error]\u001b[0m",
  errorColor: "\u001b[31m",
  importantColor: "\u001b[33m",
  resetColor: "\u001b[0m",
};

const otterlogs = {
  success: (message: string, client?: Client): void => {
    console.log(logStyles.success, message);
    if (client) {
      sendLogMessage(client, message, false);
    }
  },
  log: (message: string, client?: Client): void => {
    console.log(logStyles.info, message);
    if (client) {
      sendLogMessage(client, message, false);
    }
  },
  warn: (message: string, client?: Client): void => {
    console.warn(logStyles.warn, message);
    if (client) {
      sendLogMessage(client, message, false);
    }
  },
  error: (message: string, client?: Client): void => {
    console.error(logStyles.error, message);
    if (client) {
      sendLogMessage(client, message, true);
    }
  },
  important: (message: string): void => {
    console.log(`${logStyles.importantColor}${message}${logStyles.resetColor}`);
  },
};

// Fonction pour envoyer un message dans le salon de logs
function sendLogMessage(client: Client, message: string, error: boolean, type?: string): void {
  if (process.env.ENABLE_DISCORD_SUCCESS === "false" && type === "success") return;
  if (process.env.ENABLE_DISCORD_LOGS === "false" && type === "log") return;
  if (process.env.ENABLE_DISCORD_WARNS === "false" && type === "warn") return;
  if (process.env.ENABLE_DISCORD_ERRORS === "false" && type === "error") return;
  if (!process.env.GLOBAL_LOGS && !process.env.ERROR_LOGS) {
    console.error(logStyles.error, "Les salons de logs ne sont pas définis dans le fichier .env !");
    return;
  }

  let channel: TextChannel;
  if (!error) {
    channel = client.channels.cache.get(process.env.GLOBAL_LOGS as string) as TextChannel;
  } else {
    channel = client.channels.cache.get(process.env.ERROR_LOGS as string) as TextChannel;
  }

  if (!channel) {
    console.error(logStyles.error, "Le salon de logs n'a pas été trouvé !");
    return;
  }
  if (error) {
    console.error(logStyles.error, message);
  } else {
    channel.send(message);
  }
}


export default otterlogs;
