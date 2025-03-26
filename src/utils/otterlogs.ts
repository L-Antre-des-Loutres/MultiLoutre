// otterlogs.ts
const logStyles = {
  success: "\u001b[32m[success]\u001b[0m ",
  info: "\u001b[34m[info]\u001b[0m ",
  warn: "\u001b[33m[warn]\u001b[0m ",
  error: "\u001b[31m[error]\u001b[0m ",
  errorColor: "\u001b[31m",
  importantColor: "\u001b[33m",
  resetColor: "\u001b[0m",
};

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

export default otterlogs;
