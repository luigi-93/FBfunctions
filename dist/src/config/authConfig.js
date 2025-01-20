"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseConfigManager = exports.FirebaseConfigurationManager = void 0;
const loggerType_1 = require("../utility/loggerType");
const errorType_1 = require("../utility/errorType");
const logger = new loggerType_1.CustomLogger({ logLevel: 'debug' });
class FirebaseConfigurationManager {
    constructor() {
        this.config = null;
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new FirebaseConfigurationManager();
        }
        return this.instance;
    }
    setConfig(firebaseConfig, serviceAccountPath) {
        logger.debug('Credentials Path', 'setConfig', {
            credetial: process.env.GOOGLE_APPLICATION_CREDENTIALS
        });
        const validationResult = this.validateConfig(firebaseConfig);
        if (!validationResult.isValid) {
            throw errorType_1.CustomError.create(`Invalid Firebase configuration. Missing fields: ${validationResult.missingFields.join(', ')}`, 400, { missingFields: validationResult.missingFields });
        }
        this.config = {
            firebaseConfig,
            serviceAccountPath
        };
    }
    getConfig() {
        return this.config;
    }
    validateConfig(config) {
        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
        const missingFields = requiredFields.filter(field => config[field] === undefined || config[field]?.trim() === '');
        return {
            isValid: missingFields.length === 0,
            missingFields,
            config: missingFields.length === 0
                ? config
                : null
        };
    }
    sanitizeConfig(config) {
        const validationResult = this.validateConfig(config);
        return validationResult.isValid
            ? validationResult.config
            : null;
    }
}
exports.FirebaseConfigurationManager = FirebaseConfigurationManager;
exports.firebaseConfigManager = FirebaseConfigurationManager.getInstance();
//# sourceMappingURL=authConfig.js.map