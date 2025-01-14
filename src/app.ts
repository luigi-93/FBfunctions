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
        import { CustomLogger } from './utility/loggerType';
        import { inject, injectable } from 'inversify';
    import { SYMBOLS } from './utility/firebaseType';
    import { CustomError } from './utility/errorType';
import { error } from 'console';



    //Load environment varibles 
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
                
            const cleanup = () => {
                this.logger.info(
                    'Performing cleanup before server shutdown...'
                )
                //await dbConnection.close();
                //jobScheduler.stopAll();
                //logger.flush();
                //cache.clear();
            };

            await this.serverInitializer.initialize(app, PORT, cleanup);

            return app;

        }

        }

    
    async function createApp(): Promise<express.Express> {
        try {
            // Initialize container first
            const container = initializeContainer();

            // Verify essential bindings
            if (!container.isBound(SYMBOLS.CUSTOM_LOGGER)) {
                throw CustomError.create(
                    'CustomLogger binding not found',
                    500,
                    {
                        error: 'The instance of logger itslef is needed'
                    }
                )
            }

            if (!container.isBound(SYMBOLS.APP)) {
                throw  CustomError.create(
                    'App binding not found',
                    500,
                    {
                        error: error instanceof Error
                        ? error
                        : 'Unknow error',
                        message: 'Bind the App class before to create it instance'
                    }
                )
            }

            const application = container.get<App>(SYMBOLS.APP);
            return application.initialize();
        } catch (error) {
            throw CustomError.create(
                'Failed to create application',
                500,
                { error }
            );
        }
    }

    export const app = createApp() ;