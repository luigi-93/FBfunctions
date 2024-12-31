import winston from 'winston';
interface LoggerOptions {
    logLevel?: string;
    additionalTransports?: winston.transport[];
    sentryDsn?: string;
    contextId?: string;
}
interface LogMetadata {
    context?: string;
    [key: string]: any;
}
export declare class CustomLogger {
    private logger;
    private sentryInitialized;
    private defaultContext;
    constructor(options?: LoggerOptions);
    private initializeSentry;
    private getTracesSampleRate;
    log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: string, metadata?: LogMetadata): void;
    info(message: string, context?: string, metadata?: LogMetadata): void;
    warn(message: string, context?: string, metadata?: LogMetadata): void;
    error(message: string, context?: string, metadata?: LogMetadata): void;
    debug(message: string, context?: string, metadata?: LogMetadata): void;
    addTransport(transport: winston.transport): void;
    static create(options?: LoggerOptions): CustomLogger;
}
export {};
