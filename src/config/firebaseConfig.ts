import { FirebaseConfig } from "../utility/firebaseType";
import { firebaseConfigManager } from "./authConfig";


export function createFirebaseConfig(): FirebaseConfig {
    return {
        apiKey: process.env.FIREBASSE_API_KEY?.trim() || '',
        authDomain: process.env.FIRABASE_AUTH_DOMANI?.trim() || '',
        projectId: process.env.FIREBASE_PROJECT_ID?.trim() || '',
        appId: process.env.FIREBASE_APP_ID?.trim() || '',
    };
}

export function configureFirebase(
    config: FirebaseConfig,
    credantialsPath?: string
) {
    if (firebaseConfigManager.validateConfig(config).isValid) {
        firebaseConfigManager.setConfig(
            config,
            credantialsPath
        );
        return true;
    }
    return false
}