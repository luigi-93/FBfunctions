import { NextFunction, Request, Response} from "express";
import { CustomLogger } from "../logging/CustomLogger";


const logger = CustomLogger.create({
    logLevel: process.env.LOG_LEVEL,
});

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    logger.info(`${req.method} ${req.url}`, 'requestLogger', { headers: req.headers });
    next();
}