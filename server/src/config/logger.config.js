import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Tell winston that you want to link the colors
winston.addColors(colors);
// Define which transports the logger must use
const transports = [
    // Console transport
    new winston.transports.Console({
        format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston.format.colorize({ all: true }), winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)),
    }),
    // File transport for errors
    new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxSize: '20m',
        maxFiles: '14d',
    }),
    // File transport for all logs
    new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        maxSize: '20m',
        maxFiles: '14d',
    }),
];
// Create the logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    transports,
    exitOnError: false,
});
// Create a stream object with a 'write' function that will be used by morgan
export const morganStream = {
    write: (message) => {
        logger.http(message.substring(0, message.lastIndexOf('\n')));
    },
};
export default logger;
//# sourceMappingURL=logger.config.js.map