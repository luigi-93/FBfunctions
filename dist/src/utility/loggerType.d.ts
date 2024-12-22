import winston from 'winston';
interface LoggerOptions {
    logLevel?: string;
    additionalTransports?: winston.transport[];
    sentryDsn?: string;
    contextId?: string;
}
export declare class CustomLogger {
    private logger;
    private sentryInitialized;
    constructor(options?: LoggerOptions);
    private initializeSentry;
    private getTracesSampleRate;
    log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: string, ...meta: any[]): void;
    info(message: string, context?: string, ...meta: any[]): void;
    warn(message: string, context?: string, ...meta: any[]): void;
    error(message: string, context?: string, ...meta: any[]): void;
    debug(message: string, context?: string, ...meta: any[]): void;
    addTransport(transport: winston.transport): void;
    static create(options?: LoggerOptions): CustomLogger;
}
export {};
