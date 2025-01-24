
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

export function sanitizeMetadata(meta: any) {
        const seen = new WeakSet();
        const sanitize = (obj: any): any => {
            if (typeof obj !== 'object' || obj === null) return obj;
            if (seen.has(obj)) return '[Circular]';
            seen.add(obj);

            const result: any = Array.isArray(obj) ? [] : {};
            for (const key in obj) {
                result[key] = sanitize(obj[key]);
            }
            return result
        };
        return sanitize(meta);
    }

export function getTracesSampleRate(): number  {
    //Dinamically determine traces sample rate based on environment
    const environment = process.env.NODE_ENV as 'development' | 'production' | 'test';
    const sampleRates = {
        development: 1.0, //full tracing in development
        production: 0.1, //10% sampling in production
        test: 0.0 //no tracing in test environment
        } as const;
    return sampleRates[environment] || 0.5; //Default to 50% if unknow
    }