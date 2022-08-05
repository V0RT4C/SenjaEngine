import { log } from 'Dependencies';
import { LOG_LEVEL } from '../config.ts';

export const fileHandler = new log.handlers.RotatingFileHandler('INFO', {
    maxBytes: 1000,
    maxBackupCount: 5,
    filename: './Log/main.log'
});

await log.setup({
    handlers: {
        console: new log.handlers.ConsoleHandler('DEBUG', { formatter: rec => {
            if (rec.levelName === 'DEBUG'){
                return `\x1b[35m[${rec.levelName}][${rec.datetime.toISOString()}] ${rec.msg}\x1b[0m`
            }
            else {
                return `[${rec.levelName}][${rec.datetime.toISOString()}] ${rec.msg}`
            }
        }}),
        file: fileHandler
    },
    loggers: {
        default: {
            level: LOG_LEVEL,
            handlers: ["console", "file"]
        }
    }
});

const logger = log.getLogger('default');

//Have to flush to file every 60 secs because the default automatic flush is not working.
setInterval(() => fileHandler.flush(), 60000);

export default logger;