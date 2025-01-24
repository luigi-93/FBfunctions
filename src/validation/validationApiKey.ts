import { inject } from "inversify";
import { 
    ApiKeyMetadata, 
    SecurityScopes, 
    SYMBOLS} 
    from "../utility/firebaseType";
import { CustomLogger } from "../logging/CustomLogger";




export class ApiKeyValidator {
    

    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private readonly logger: CustomLogger
    ) {}

    validate(metadata: ApiKeyMetadata): boolean {
        return (
            this.checkExpiration(metadata) &&
            this.checkScopes(metadata) &&
            this.checkUsagePatterns(metadata)
        )
    }
    private checkExpiration(metadata: ApiKeyMetadata): boolean {
        const now = Math.floor(Date.now() / 1000);
        const isValid = !metadata.expiresAt || metadata.expiresAt > now;

        if (!isValid) {
            this.logger.warn(
                'API Key expired',
                'ApiKeyValidator',
                {
                    keyId: metadata.id.slice(0,4) + '****',
                    exipiresAt: metadata.expiresAt,
                });
        }

        return isValid;
    }
    private checkScopes(metadata: ApiKeyMetadata): boolean {
        const hasValidScopes =
            metadata.scopes.length > 0 &&
            metadata.scopes.every((scope) =>
                Object.values(SecurityScopes).includes(scope));

        if (!hasValidScopes) {
            this.logger.error(
                'Invalid API Key scopes',
                'ApikeyValidator',
                {
                    keyId: metadata.id.slice(0,4) + '****',
                    scopes: metadata.scopes,
                });
        }
        return hasValidScopes;

    }
    private checkUsagePatterns(metadata: ApiKeyMetadata): boolean {
        const MAX_DAILY_USAGE = 1000; // Example limit
        const usageWithinLimit = 
            !metadata.usageCount || metadata.usageCount < MAX_DAILY_USAGE;

        if (!usageWithinLimit) {
            this.logger.warn(
                'Excessive API key usage',
                'ApikeyValidator', 
                {
                    keyId: metadata.id.slice(0,4) + '****',
                    usageCount: metadata.usageCount,
                });
        }

        return usageWithinLimit;
    }

    calculateSecurityLevel(metadata: ApiKeyMetadata): 'LOW' | 'MEDIUM' | 'HIGH' {
        const scopeWeight = {
            [SecurityScopes.Admin]: 3,
            [SecurityScopes.SuperAdmin]: 5,
            [SecurityScopes.User]: 1
        };

        const totalWeight = metadata.scopes.reduce(
            (acc, scope) => acc + (scopeWeight[scope] || 0),
            0
        );

        return  totalWeight > 4? 'HIGH':
                totalWeight > 2? 'MEDIUM':
                'LOW';
    }
}