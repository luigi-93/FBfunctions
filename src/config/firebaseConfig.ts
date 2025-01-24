import { CustomLogger } from "../logging/CustomLogger";
import { FirebaseConfig } from "../utility/firebaseType";
import { firebaseConfigManager } from "./authConfig";

const logger: CustomLogger = new CustomLogger({ logLevel: 'debug'})

export function createFirebaseConfig(): FirebaseConfig {
    const config ={
        apiKey: process.env.FIREBASE_API_KEY?.trim() || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN?.trim() || '',
        projectId: process.env.FIREBASE_PROJECT_ID?.trim() || '',
        appId: process.env.FIREBASE_APP_ID?.trim() || '',
    };
    logger.debug('FirebaseConfig','createFirebaseConfig',{config, context: 'createFirebaseConfig' })
    return config
}

export function configureFirebase(
    config: FirebaseConfig,
    credantialsPath?: string
) {
    logger.debug('Input FirebaseConfig','configureFirebase',{ config, context: 'configureFirebase'})
    
    const validationResult = firebaseConfigManager.validateConfig(config);

    logger.debug('FirebaseConfig validation result', 'configureFirebase', { validationResult })
    
    if ( validationResult.isValid) {
        firebaseConfigManager.setConfig(
            config,
            credantialsPath
        );

        logger.debug('Firebase configuration successfully set.')
        return true;
    }

    logger.warn('Firebase configuration is invalid. Missing fields')
    return false
}