    import express from 'express';
    import { 
        initializeContainer, 
            } 
        from './ioc/index';
        import dotenv from 'dotenv';
        import { Server } from './server/server';
        import { ApiApp } from './routes';
        import { ApiKeyManager } from './services/apiKeyManager';
        import { configureFirebase, createFirebaseConfig } from './config/firebaseConfig';
        import { ServerInitializer } from './server/serverInitializer';
        import { CustomLogger } from './logging/customLogger';
        import { inject, injectable } from 'inversify';
    import { requiredBindngs, SYMBOLS } from './utility/firebaseType';
    import { CustomError } from './errors/customError';

    dotenv.config();

    @injectable()
    export class App {
        constructor(
            @inject(SYMBOLS.CUSTOM_LOGGER) private readonly logger: CustomLogger,
            @inject(SYMBOLS.SERVER) private readonly server: Server,
            @inject(SYMBOLS.API_APP) private readonly apiApp: ApiApp,
            @inject(SYMBOLS.API_KEY_MANAGER) private readonly apikeyManager: ApiKeyManager,
            @inject(SYMBOLS.SERVER_INITIALIZER) private readonly serverInitializer: ServerInitializer
        ) {}

        private async cleanup(): Promise<void> {
            this.logger.info(
                'Performing cleanup before server shutdown...'
            )
            //await dbConnection.close();
            //jobScheduler.stopAll();
            //logger.flush();
            //cache.clear();
        };

        async initialize(): Promise<express.Express> {
            const app: express.Express = express();
                
            this.logger.info('strarting app...');
            
            const firebaseConfig = createFirebaseConfig();
            if (!configureFirebase(firebaseConfig, process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
                this.logger.error(
                    'Invalid Firebase configuration',
                    'App initilization'
                );
                process.exit(1);
            }
            const PORT = Number(process.env.PORT || 3000);
            await this.serverInitializer.initialize(app, PORT, () => this.cleanup());

            return app;

        }

        }

    
    async function createApp(): Promise<express.Express> {
        const logger = new CustomLogger({ logLevel: 'debug'})
        try {
            logger.debug('Starting application creation', 'App-Init')
            const initializedContainer = await initializeContainer();
            if(!initializedContainer) {
                throw CustomError.create(
                    'Container inialization',
                    401,
                    {
                        
                    }
                )
            }
            

            for (const binding of requiredBindngs) {
                if (!initializedContainer.isBound(binding.symbol)) {
                    logger.error(
                        `Missing required binding: ${binding.name}`, 
                        'App-Init'
                    )
                    throw CustomError.create(
                        `${binding.name} binding not found`,
                        500, {
                            error: `Required binding ${binding.name} is missing`,
                            symbol: binding.symbol.toString(),
                        }
                    )
                }
            }
            
            const application = initializedContainer.get<App>(SYMBOLS.APP);
            const result = await application.initialize();

            logger.info(
                'Application created successfully',
                'App-Init'
            )
            return result;
        } catch (error) {
            logger.error(
                'Failed to create application',
                'App-Init',
                {
                    error: error instanceof Error
                    ? {
                        message: error.message,
                        stack: error.stack,
                        name: error.name
                    }
                    : 'Unknow error'
                }
            )
            throw CustomError.create(
                'Failed to create application',
                500,
                { error }
            );
        }
    }

export { createApp as app };