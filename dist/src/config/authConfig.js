"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseConfigManager = exports.FirebaseConfigurationManager = void 0;
const errorType_1 = require("../utility/errorType");
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