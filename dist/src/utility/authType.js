"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyManager = exports.ApikeyTokenGenerator = void 0;
const firebaseType_1 = require("./firebaseType");
const loggerType_1 = require("./loggerType");
const uuid_1 = require("uuid");
class ApikeyTokenGenerator {
    static generateMockToken(apikey, metadata) {
        const defaultMetadata = {
            id: (0, uuid_1.v4)(),
            name: 'API Key Service Account',
            scopes: [firebaseType_1.SecurityScopes.User],
            provider: firebaseType_1.FirebaseAuthProvider.EMAIL_PASSWORD,
            createdAt: Math.floor(Date.now() / 1000)
        };
        const mergedMetadata = {
            ...defaultMetadata,
            ...metadata
        };
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = mergedMetadata.expirestAt || (now + (24 * 60 * 60));
        try {
            return {
                aud: process.env.FIREBASE_PROJECT_ID || 'default-project-id',
                exp: expiresAt,
                iat: now,
                iss: `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID || 'default-project-id'}`,
                sub: mergedMetadata.id,
                uid: `apikey-${mergedMetadata.id.slice(0, 8)}`,
                acl: mergedMetadata.scopes,
                name: mergedMetadata.name,
                email: `apikey-${mergedMetadata.id.slice(0, 8)}@system.local`,
                auth_time: now,
                firebase: {
                    identities: {},
                    sign_in_provider: mergedMetadata.provider || 'custom',
                    token_type: 'api_key',
                    api_key_id: mergedMetadata.id
                },
                ...(mergedMetadata.additionalClaims || {})
            };
        }
        catch (error) {
            this.logger.error('Failed to generate mock token', 'ApikeyTokenGenerator', {
                error,
                apikey: apikey.slice(0, 4) + '****'
            });
            throw error;
        }
    }
    static createApiKeyManager() {
        const apiKeys = {};
        const logger = loggerType_1.CustomLogger.create();
        return {
            create(name, options = {}) {
                const apiKey = `sk_${(0, uuid_1.v4)()}`;
                const metadata = {
                    id: apiKey,
                    name,
                    scopes: options.scopes || [firebaseType_1.SecurityScopes.User],
                    provider: options.provider || firebaseType_1.FirebaseAuthProvider.EMAIL_PASSWORD,
                    createdAt: Math.floor(Date.now() / 1000),
                    expirestAt: options.expiresAt,
                    additionalClaims: options.additionalClaims
                };
                return { apiKey, metadata };
            },
            get(apiKey) {
                const metedata = apiKeys[apiKey];
                if (!metedata) {
                    logger.warn('API Key not found', 'ApiKetManager', {
                        keyId: apiKey.slice(0, 4) + '****'
                    });
                }
                return metedata;
            },
            revoke(apiKey) {
                if (apiKeys[apiKey]) {
                    logger.info('API Key revoked', 'ApiKeyManager', {
                        keyId: apiKey.slice(0, 4) + '****'
                    });
                    delete apiKeys[apiKey];
                }
                else {
                    logger.warn('Attempt to revoke non-existent API key', 'ApiKeyManager', {
                        keyId: apiKey.slice(0, 4) + '****'
                    });
                }
            }
        };
    }
}
exports.ApikeyTokenGenerator = ApikeyTokenGenerator;
ApikeyTokenGenerator.logger = loggerType_1.CustomLogger.create();
exports.ApiKeyManager = ApikeyTokenGenerator.createApiKeyManager();
//# sourceMappingURL=authType.js.map