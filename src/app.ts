import express from 'express';
import { container, iocContainer, loadProviderModule } from './ioc';
    import dotenv from 'dotenv';
    import { Server } from './server/server';
    import { ApiApp } from './routes';
    import { ApiKeyManager } from './services/apiKeyManager';
    import { configureFirebase, createFirebaseConfig } from './config/firebaseConfig';
    import { ServerInitializer } from './server/serverInitializer';
    import { CustomLogger } from './utility/loggerType';
    import { inject, injectable } from 'inversify';
import { SYMBOLS } from './utility/firebaseType';


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

    // Initialize provider module (IoC bidings)
    loadProviderModule();


    // Export a function that creates and initializes the app
    export async function createApp(): Promise<express.Express> {
        const application = container.get<App>(SYMBOLS.APP);
        return application.initialize();
    }


    export const app = createApp();