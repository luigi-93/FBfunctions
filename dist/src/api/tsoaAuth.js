"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressAuthentication = expressAuthentication;
const customError_1 = require("../errors/customError");
const index_1 = require("../ioc/index");
const utilityKeys_1 = require("../utility/utilityKeys");
async function expressAuthentication(request, securityName, scopes = []) {
    try {
        const strategyFactory = index_1.container.get(utilityKeys_1.SYMBOLS.AUTH_STRATEGY_FACTORY);
        if (!strategyFactory) {
            throw customError_1.CustomError.create('Strategy factory not provided', 401, { securityName });
        }
        console.log("strategyFactory type:", typeof strategyFactory);
        console.log("strategyFactory has getStrategy:", typeof strategyFactory.getStrategy === 'function');
        if (!['jwt', 'apikey'].includes(securityName.toLowerCase())) {
            throw customError_1.CustomError.create('Invalid security scheme', 401, {
                securityName,
                supportedSchemes: ['jwt', 'apikey']
            });
        }
        const strategyName = securityName.toLowerCase() === 'jwt'
            ? 'FirebaseJwtAuthStrategy'
            : 'ApiKeyStrategy';
        const strategy = strategyFactory.getStrategy(strategyName);
        return await strategy.authenticate(request, securityName, scopes);
    }
    catch (error) {
        console.error("Authenticated error details: ", error);
        throw customError_1.CustomError.create('AUthentication failed', 401, {
            originalError: error instanceof Error ? error.message : 'Unknown error',
            securityName
        });
    }
}
//# sourceMappingURL=tsoaAuth.js.map