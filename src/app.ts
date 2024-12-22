import express from 'express';
import { iocContainer, loadProviderModule } from './ioc';
import dotenv from 'dotenv';
import { Server } from './server/server';
import { ApiApp } from './routes';
import { ApikeyManager } from './services/apiKeyManager';
import { configureFirebase, createFirebaseConfig } from './config/firebaseConfig';
import { ServerInitializer } from './server/serverInitializer';
import { CustomLogger } from './utility/loggerType';


//Load environment varibles 
dotenv.config();

// Initialize provider module (IoC bidings)
loadProviderModule();

async function main() {
    const app: express.Express = express();
    const logger = iocContainer.get(CustomLogger)

    

    logger.info('strarting app...');

    const firebaseConfig = createFirebaseConfig();
    if (!configureFirebase(firebaseConfig, process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        logger.error(
            'Invalid Firebase configuration',
            'App initilization'
        );
        process.exit(1);
    }

    const serverInitializer = new ServerInitializer(
        logger,
        iocContainer.get(Server),
        iocContainer.get(ApiApp),
        iocContainer.get(ApikeyManager)
    );

    const PORT = Number(process.env.PORT || 3000);
    
    const cleanup = () => {
        logger.info(
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

export const app = main();