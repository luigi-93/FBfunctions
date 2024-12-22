"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirebaseConfig = createFirebaseConfig;
exports.configureFirebase = configureFirebase;
const authConfig_1 = require("./authConfig");
function createFirebaseConfig() {
    return {
        apiKey: process.env.FIREBASSE_API_KEY?.trim() || '',
        authDomain: process.env.FIRABASE_AUTH_DOMANI?.trim() || '',
        projectId: process.env.FIREBASE_PROJECT_ID?.trim() || '',
        appId: process.env.FIREBASE_APP_ID?.trim() || '',
    };
}
function configureFirebase(config, credantialsPath) {
    if (authConfig_1.firebaseConfigManager.validateConfig(config).isValid) {
        authConfig_1.firebaseConfigManager.setConfig(config, credantialsPath);
        return true;
    }
    return false;
}
//# sourceMappingURL=firebaseConfig.js.map