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

@injectable()
export class CustomLogger {
    private logger: Logger;
    private sentryInitialized: boolean = false;

    //info: Sets the defaoult log level for this logger instance. Possible values include 'info', 'warn','error','debug' Only messages at this level or higher will be logged.
    //additionalTransports: An array of Optional trasport instance(like file or http transports) that specify additinal output destination.
    constructor(options: LoggerOptions = {}) {

        const {
            logLevel,
            additionalTransports = [],
            sentryDsn,
            contextId
        } = options;

        //Automatically determine log level Based on environment
        const environment: keyof typeof defaultLogLevels = process.env.NODE_ENV as keyof typeof defaultLogLevels || 'development';
        const defaultLogLevels = {
            development: 'debug',
            production: 'error',
            test: 'info'
        };

        const effectiveLogLevel = logLevel || defaultLogLevels[environment] || 'info';

        if(sentryDsn) {
            this.initializeSentry(sentryDsn);
        }

        //set up logger with enhanced formatting
        this.logger = winston.createLogger({
            //controls the verbosity of the logger
            level: effectiveLogLevel,
            //how the log message should be formatted
            format: format.combine(
                format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
                format.printf(({ timestamp, level, message, ...meta}) => {
                    //fa un check se il meta contiene altre info, se si torna un file json, altrimenti ciao, per esempio potrebbe contenere info come 'invalid passaword'
                    const contextString = context 
                    ?  `[${context}]` 
                    : '';
                    const metaString = Object.keys(meta).length  
                        ? ` - ${JSON.stringify(meta)}` 
                        : '';
                    //here return any extra information formated with the printf functions
                    return `${timestamp} ${contextString} [${level.toUpperCase()}]: ${message} ${metaString}`;
                })
            ),
            transports: [
                //here is set up where adding any additionalTransports
                new transports.Console({
                    //adds coloro to console log message for easier readability
                    format: format.combine(
                        format.colorize({ all: true}),
                        format.printf(({ timestamp, level, message, ...meta}) => {
                            const contextString = context 
                            ?  `[${context}]` 
                            : '';
                            const metaString = Object.keys(meta).length  
                                ? ` - ${JSON.stringify(meta)}`
                                : '';
                            return `${timestamp} ${contextString} [${level.toUpperCase()}]: ${message}${metaString}`;
                        })
                    )
                }),
                ...additionalTransports
            ]
        });
    }

    private initializeSentry(sentryDsn: string): void {
        if(!this.sentryInitialized) {
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
                this.logger.info('Sentry initialized successfully');
            } catch(initError) {
                this.logger.error('Failed to initialize Sentry','Sentry-init', {
                    error: initError
                });
            }
           
        }
    }
    private getTracesSampleRate(): number  {
        //Dinamically determine traces sample rate based on environment
        const environment: keyof typeof sampleRates = process.env.NODE_ENV as keyof typeof sampleRates || 'development';
        const sampleRates = {
            development: 1.0, //full tracing in development
            production: 0.1, //10% sampling in production
            test: 0.0 //no tracing in test environment
        };
        return sampleRates[environment] || 0.5; //Default to 50% if unknow
    }


    public log(level: 'info'| 'warn' | 'error' | 'debug', message: string, context?: string, ...meta: any[]): void {
        this.logger.log({
            level, 
            message,
            context,
            ...meta});
    }
    public info(message: string, context?: string, ...meta: any[]): void{
        this.logger.info({message, context, ...meta});
    }
    public warn(message: string, context?: string,...meta: any[]){
        this.logger.warn({message, context, ...meta});
    }
    public error(message: string, context?: string,...meta: any[]){

        //avoid undefined apparing logs
        const  contextString = context || 'general'

        this.logger.error({message, context, ...meta});

        //Optional Sentry error tracking
        if (this.sentryInitialized) {
            try{
                const error = new Error(message);

                const sentryResult = Sentry.captureException(error, {
                    tags: {
                        context,
                        environment: process.env.NODE_ENV
                    },
                    extra: {
                        metadata: meta.length > 0 ? meta : undefined,
                        timestamp: new Date().toISOString()
                    }
                });

                if(sentryResult) {
                    this.logger.debug('Error reported to Sentry','sentry-tracking', {
                        sentryEventId: sentryResult
                    });
                }
            } catch (captureError) {
                this.logger.warn('Failed to capture error in Sentry', 'sentry-error', {
                    originalError: message,
                    captureError
                });
            }

        }
    }
    public debug(message: string, context?: string,...meta: any[]){
        this.logger.debug({message, context, ...meta});
    }
    //ha il suo perchè! permette di aggiorngere nuovi winston.transport (anche quando logger è inizializzato)
    public addTransport(transport: winston.transport) {
        this.logger.add(transport);
    }

    //per creare un logger più semplice senza usare il costruttore
    public static create(
        options: LoggerOptions = {}): CustomLogger {
        return new CustomLogger(options);
    }
}