"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyValidator = void 0;
const firebaseType_1 = require("../utility/firebaseType");
const loggerType_1 = require("../utility/loggerType");
class ApiKeyValidator {
    constructor(logger) {
        this.logger = logger || loggerType_1.CustomLogger.create();
    }
    validate(metadata) {
        return (this.checkExpiration(metadata) &&
            this.checkScopes(metadata) &&
            this.checkUsagePatterns(metadata));
    }
    checkExpiration(metadata) {
        const now = Math.floor(Date.now() / 1000);
        const isValid = !metadata.expiresAt || metadata.expiresAt > now;
        if (!isValid) {
            this.logger.warn('API Key expired', 'ApiKeyValidator', {
                keyId: metadata.id.slice(0, 4) + '****',
                exipiresAt: metadata.expiresAt,
            });
        }
        return isValid;
    }
    checkScopes(metadata) {
        const hasValidScopes = metadata.scopes.length > 0 &&
            metadata.scopes.every((scope) => Object.values(firebaseType_1.SecurityScopes).includes(scope));
        if (!hasValidScopes) {
            this.logger.error('Invalid API Key scopes', 'ApikeyValidator', {
                keyId: metadata.id.slice(0, 4) + '****',
                scopes: metadata.scopes,
            });
        }
        return hasValidScopes;
    }
    checkUsagePatterns(metadata) {
        const MAX_DAILY_USAGE = 1000;
        const usageWithinLimit = !metadata.usageCount || metadata.usageCount < MAX_DAILY_USAGE;
        if (!usageWithinLimit) {
            this.logger.warn('Excessive API key usage', 'ApikeyValidator', {
                keyId: metadata.id.slice(0, 4) + '****',
                usageCount: metadata.usageCount,
            });
        }
        return usageWithinLimit;
    }
    calculateSecurityLevel(metadata) {
        const scopeWeight = {
            [firebaseType_1.SecurityScopes.Admin]: 3,
            [firebaseType_1.SecurityScopes.SuperAdmin]: 5,
            [firebaseType_1.SecurityScopes.User]: 1
        };
        const totalWeight = metadata.scopes.reduce((acc, scope) => acc + (scopeWeight[scope] || 0), 0);
        return totalWeight > 4 ? 'HIGH' :
            totalWeight > 2 ? 'MEDIUM' :
                'LOW';
    }
}
exports.ApiKeyValidator = ApiKeyValidator;
//# sourceMappingURL=validationApiKey.js.map