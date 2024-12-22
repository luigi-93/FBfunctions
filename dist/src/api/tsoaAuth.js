"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const strategyAuth_1 = require("../auth/strategyAuth");
const ioc_1 = require("../ioc");
const errorType_1 = require("../utility/errorType");
const authStrategyFactory = new strategyAuth_1.AuthStrategyFactory(ioc_1.iocContainer);
async function expressAuthentication(request, securityName, scopes = []) {
    try {
        if (!['jwt', 'apikey'].includes(securityName.toLowerCase())) {
            throw errorType_1.CustomError.create('Invalid security scheme', 401, {
                securityName,
                supportedSchemes: ['jwt', 'apikey']
            });
        }
        const strategyName = securityName.toLowerCase() === 'jwt'
            ? 'FirebaseJwtAuthStrategy'
            : 'ApiKeyStrategy';
        const strategy = authStrategyFactory.getStrategy(strategyName);
        return await strategy.authenticate(request, securityName, scopes);
    }
    catch (error) {
        if (error instanceof errorType_1.CustomError) {
            throw error;
        }
        throw errorType_1.CustomError.create('AUthentication failed', 401, {
            originalError: error instanceof Error ? error.message : 'Unknown error',
            securityName
        });
    }
}
//# sourceMappingURL=tsoaAuth.js.map