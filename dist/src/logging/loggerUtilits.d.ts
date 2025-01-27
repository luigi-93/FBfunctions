import winston from "winston";
export interface LoggerOptions {
    logLevel?: string;
    additionalTransports?: winston.transport[];
    sentryDsn?: string;
    contextId?: string;
}
export interface LogMetadata {
    context?: string;
    [key: string]: any;
}
export declare function sanitizeMetadata(meta: any): any;
export declare function getTracesSampleRate(): number;
