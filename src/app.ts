import express from 'express';
import { iocContainer, loadProviderModule } from './ioc';
import dotenv from 'dotenv';
import { Server } from './server/server';
import { ApiApp } from './routes';
import { ApikeyManager } from './services/apiKeyManager';
import { configureFirebase, createFirebaseConfig } from './config/firebaseConfig';
import { ServerInitializer } from './server/serverInitializer';
import { CustomLogger } from './utility/loggerType';
import { inject, injectable } from 'inversify';


//Load environment varibles 
dotenv.config();


@injectable()
class App {
    constructor(
        @inject(CustomLogger) private readonly logger: CustomLogger,
        @inject(Server) private readonly server: Server,
        @inject(ApiApp) private readonly apiApp: ApiApp,
        @inject(ApikeyManager) private readonly apikeyManager: ApikeyManager
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
    
        const serverInitializer = new ServerInitializer(
            this.logger,
            this.server,
            this.apiApp,
            this.apikeyManager
        );
    
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

        await serverInitializer.initialize(app, PORT, cleanup);

        return app;

}

}

// Initialize provider module (IoC bidings)
loadProviderModule();


// Export a function that creates and initializes the app
export async function createApp(): Promise<express.Express> {
    const application = iocContainer.get(App);
    return application.initialize();
}


export const app = createApp();