"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirebaseConfig = createFirebaseConfig;
exports.configureFirebase = configureFirebase;
const customLogger_1 = require("../logging/customLogger");
const authConfig_1 = require("./authConfig");
const logger = new customLogger_1.CustomLogger({ logLevel: 'debug' });
function createFirebaseConfig() {
    const config = {
        apiKey: process.env.FIREBASE_API_KEY?.trim() || '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN?.trim() || '',
        projectId: process.env.FIREBASE_PROJECT_ID?.trim() || '',
        appId: process.env.FIREBASE_APP_ID?.trim() || '',
    };
    logger.debug('FirebaseConfig', 'createFirebaseConfig', { config, context: 'createFirebaseConfig' });
    return config;
}
function configureFirebase(config, credantialsPath) {
    logger.debug('Input FirebaseConfig', 'configureFirebase', { config, context: 'configureFirebase' });
    const validationResult = authConfig_1.firebaseConfigManager.validateConfig(config);
    logger.debug('FirebaseConfig validation result', 'configureFirebase', { validationResult });
    if (validationResult.isValid) {
        authConfig_1.firebaseConfigManager.setConfig(config, credantialsPath);
        logger.debug('Firebase configuration successfully set.');
        return true;
    }
    logger.warn('Firebase configuration is invalid. Missing fields');
    return false;
}
//# sourceMappingURL=firebaseConfig.js.map