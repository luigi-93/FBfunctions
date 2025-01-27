"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const strategyHelpers_1 = require("../strategies/strategyHelpers");
const ioc_1 = require("../ioc");
const customError_1 = require("../errors/customError");
async function expressAuthentication(request, securityName, scopes = []) {
    try {
        const authStrategyFactory = ioc_1.iocContainer.get(strategyHelpers_1.AuthStrategyFactory);
        if (!['jwt', 'apikey'].includes(securityName.toLowerCase())) {
            throw customError_1.CustomError.create('Invalid security scheme', 401, {
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
        throw customError_1.CustomError.create('AUthentication failed', 401, {
            originalError: error instanceof Error ? error.message : 'Unknown error',
            securityName
        });
    }
}
//# sourceMappingURL=tsoaAuth.js.map