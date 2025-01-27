import winston from 'winston';
import { LoggerOptions, LogMetadata } from './loggerUtilits';
export declare class CustomLogger {
    private logger;
    private sentryInitialized;
    private defaultContext;
    constructor(options?: LoggerOptions);
    private initializeSentry;
    log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: string, metadata?: LogMetadata): void;
    info(message: string, context?: string, metadata?: LogMetadata): void;
    warn(message: string, context?: string, metadata?: LogMetadata): void;
    error(message: string, context?: string, metadata?: LogMetadata): void;
    debug(message: string, context?: string, metadata?: LogMetadata): void;
    addTransport(transport: winston.transport): void;
    static create(options?: LoggerOptions): CustomLogger;
}
