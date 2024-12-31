import { injectable } from 'inversify';
import  winston, 
        { 
            format, 
            transports, 
            Logger
        } 
        from 'winston';
import * as Sentry from '@sentry/node';


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

@injectable()
export class CustomLogger {
    private logger: Logger;
    private sentryInitialized: boolean = false;
    private defaultContext: string;

    //info: Sets the defaoult log level for this logger instance. Possible values include 'info', 'warn','error','debug' Only messages at this level or higher will be logged.
    //additionalTransports: An array of Optional trasport instance(like file or http transports) that specify additinal output destination.
    constructor(options: LoggerOptions = {}) {

        const {
            logLevel,
            additionalTransports = [],
            sentryDsn,
            contextId = 'default'
        } = options;

        this.defaultContext = contextId;

        //Automatically determine log level Based on environment
        const environment = (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development';
        
        const defaultLogLevels = {
            development: 'debug',
            production: 'error',
            test: 'info'
        } as const;

        const effectiveLogLevel = logLevel || defaultLogLevels[environment] || 'info';

        const customFormat = format.printf(({ timestamp, level, message, context = this.defaultContext, ...meta}) => {
            const contextString = context ? `[${context}]` : '';
            const metaString = Object.keys(meta).length ? ` - ${JSON.stringify(meta)}` : '';
            return `${timestamp} ${contextString} [${level.toUpperCase()}]: ${message} ${metaString}`;
        });

    
        //set up logger with enhanced formatting
        this.logger = winston.createLogger({
            //controls the verbosity of the logger
            level: effectiveLogLevel,
            //how the log message should be formatted
            format: format.combine(
                format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                customFormat
            ),
            transports: [
                //here is set up where adding any additionalTransports
                new transports.Console({
                    //adds coloro to console log message for easier readability
                    format: format.combine(
                        format.colorize({ all: true}),
                        customFormat
                    )
                }),
                ...additionalTransports
            ]
        });

        if(sentryDsn) {
            this.initializeSentry(sentryDsn);
        }
    }

    private initializeSentry(sentryDsn: string): void {
        if(this.sentryInitialized) return;
        
            try {
                Sentry.init({
                    dsn: sentryDsn,
                    environment: process.env.NODE_ENV || 'development',
                    tracesSampleRate: this.getTracesSampleRate(),
                    // Additional Sentry configuration options
                    beforeSend: (event) =>  {
                        if(event.user) {
                            delete event.user.email;
                            delete event.user.ip_address;
                        }  
                        return event;
                    }
                });
                this.sentryInitialized = true;
                this.info('Sentry initialized successfully');
            } catch(error) {
                this.error(
                    'Failed to initialize Sentry','Sentry-init', 
                    {
                        error
                    });
            }
           
        
    }
    private getTracesSampleRate(): number  {
        //Dinamically determine traces sample rate based on environment
        const environment = process.env.NODE_ENV as 'development' | 'production' | 'test';
        const sampleRates = {
            development: 1.0, //full tracing in development
            production: 0.1, //10% sampling in production
            test: 0.0 //no tracing in test environment
        } as const;
        return sampleRates[environment] || 0.5; //Default to 50% if unknow
    }


    public log(level: 'info'| 'warn' | 'error' | 'debug', message: string, context?: string, metadata: LogMetadata = {}): void {
        this.logger.log({
            level, 
            message,
            context: context || this.defaultContext,
            ...metadata});
    }
    public info(message: string, context?: string, metadata: LogMetadata = {}): void{
        this.log('info', message, context, metadata);
    }
    public warn(message: string, context?: string, metadata: LogMetadata = {}){
        this.log('warn', message, context, metadata);
    }
    public error(message: string, context?: string,metadata: LogMetadata = {}){
        this.log('error', message, context, metadata);

        //Optional Sentry error tracking
        if (this.sentryInitialized) {
            try{
                const error = new Error(message);
                const sentryResult = Sentry.captureException(error, {
                    tags: {
                        context: context || this.defaultContext,
                        environment: process.env.NODE_ENV
                    },
                    extra: {
                        metadata,
                        timestamp: new Date().toISOString()
                    }
                });

                if(sentryResult) {
                    this.debug(
                        'Error reported to Sentry',
                        'sentry-tracking', 
                        {
                            sentryEventId: sentryResult
                        });
                }
            } catch (error) {
                this.warn(
                    'Failed to capture error in Sentry', 
                    'sentry-error', 
                    {
                        originalError: message,
                        error
                    });
            }

        }
    }
    public debug(message: string, context?: string, metadata: LogMetadata = {}){
        this.log('debug', message, context, metadata);
    }
    //ha il suo perchè! permette di aggiorngere nuovi winston.transport (anche quando logger è inizializzato)
    public addTransport(transport: winston.transport): void {
        this.logger.add(transport);
    }

    //per creare un logger più semplice senza usare il costruttore
    public static create(
        options: LoggerOptions = {}): CustomLogger {
        return new CustomLogger(options);
    }
}