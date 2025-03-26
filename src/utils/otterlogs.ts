import { Client, TextChannel } from "discord.js";

const logStyles = {
  success: "\u001b[32m[success]\u001b[0m ",
  info: "\u001b[34m[info]\u001b[0m ",
  warn: "\u001b[33m[warn]\u001b[0m ",
  error: "\u001b[31m[error]\u001b[0m ",
  errorColor: "\u001b[31m",
  importantColor: "\u001b[33m",
  resetColor: "\u001b[0m",
};

let logsGlobalChannel: string;
let logsErrorChannel: string;
logsGlobalChannel = process.env.GLOBAL_LOGS as string;
logsErrorChannel = process.env.ERROR_LOGS as string;

const otterlogs = {
  success: (...messages: unknown[]): void => {
    console.log(logStyles.success, ...messages);
  },
  log: (...messages: unknown[]): void => {
    console.log(logStyles.info, ...messages);
  },
  warn: (...messages: unknown[]): void => {
    console.warn(logStyles.warn, ...messages);
  },
  error: (...messages: unknown[]): void => {
    console.error(logStyles.error, ...messages);
  },
  important: (...messages: unknown[]): void => {
    console.log(logStyles.importantColor, ...messages, logStyles.resetColor);
  },
};

// Fonction pour envoyer un message dans le salon de logs
function sendLogsMessage(client: Client, message: string, error: boolean = false): void {
  const channel = client.channels.cache.get(error ? logsErrorChannel : logsGlobalChannel) as TextChannel;
  if (!channel) {
    console.error(logStyles.error, "Le salon de logs n'a pas été trouvé.");
    return;
  }
  channel.send(message);
}


export default otterlogs;
