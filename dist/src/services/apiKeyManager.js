"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyManagerInstance = exports.ApikeyManager = void 0;
const errorType_1 = require("../utility/errorType");
const firebaseType_1 = require("../utility/firebaseType");
const loggerType_1 = require("../utility/loggerType");
const validationApiKey_1 = require("../validation/validationApiKey");
const apiKeyStorage_1 = require("./apiKeyStorage");
const crypto = __importStar(require("crypto"));
class ApikeyManager {
    constructor(storageAdapter, logger) {
        this.keyRotationInterval = 30 * 24 * 60 * 60;
        this.storageAdapter = storageAdapter || new apiKeyStorage_1.InMemoryStorageAdapter();
        this.validator = new validationApiKey_1.ApiKeyValidator(logger);
        this.logger = logger || loggerType_1.CustomLogger.create();
    }
    async create(name, options = {}) {
        const apiKey = this.generateSecureApiKey();
        const now = Math.floor(Date.now() / 1000);
        const metadata = {
            id: apiKey,
            name,
            scopes: options.scopes || [firebaseType_1.SecurityScopes.User],
            provider: options.provider || firebaseType_1.FirebaseAuthProvider.EMAIL_PASSWORD,
            createdAt: now,
            expirestAt: options.expiresAt || (now + this.keyRotationInterval),
            status: 'ACTIVE',
            additionalClaims: options.additionalClaims
        };
        try {
            await this.storageAdapter.save(apiKey, metadata);
            this.logger.info('API Key created', 'ApiKeyManager', {
                keyId: apiKey.slice(0, 4) + '****',
                name: metadata.name
            });
            return { apiKey, metadata };
        }
        catch (error) {
            this.logger.error('Failed to create API key', 'ApikeyManager', {
                error,
                name
            });
            throw errorType_1.CustomError.create('Failed to create API key', 500, { error });
        }
    }
    async get(apiKey) {
        try {
            const metadata = await this.storageAdapter.get(apiKey);
            if (!metadata) {
                this.logger.warn('API key not found', 'ApiKeymanager', {
                    keyId: apiKey.slice(0, 4) + '****'
                });
                return undefined;
            }
            if (!this.validator.validate(metadata)) {
                this.logger.warn('API key validation failed', 'ApikeyManagere', {
                    keyId: apiKey.slice(0, 4) + '****'
                });
                return undefined;
            }
            return metadata;
        }
        catch (error) {
            this.logger.error('Error retrieving API key', 'ApikeyManager', {
                error,
                keyId: apiKey.slice(0, 4) + '****'
            });
            return undefined;
        }
    }
    async revoke(apiKey) {
        try {
            const metadata = await this.storageAdapter.get(apiKey);
            if (metadata) {
                metadata.status = 'REVOKED';
                await this.storageAdapter.save(apiKey, metadata);
                this.logger.info('API key rovoked', 'ApiKeyManager', {
                    keyId: apiKey.slice(0, 4) + '****'
                });
            }
            else {
                this.logger.warn('Attempted to revoke non-existent API key', 'ApiKeyManager', {
                    keyId: apiKey.slice(0, 4) + '****'
                });
            }
        }
        catch (error) {
            this.logger.error('Error revoking API key', 'ApiKeyManager', {
                error,
                keyId: apiKey.slice(0, 4) + '****'
            });
            throw errorType_1.CustomError.create('Failed to revoke API key', 500, { error });
        }
    }
    async rotateKey(existingApiKey, options) {
        try {
            const oldMetadata = await this.get(existingApiKey);
            if (!oldMetadata) {
                throw errorType_1.CustomError.create('API key not found for rotation', 404, { existingApiKey });
            }
            const newKeyMetadata = {
                scopes: options?.transferScopes
                    ? oldMetadata?.scopes
                    : undefined,
                additionalClaims: options?.transferScopes
                    ? oldMetadata?.additionalClaims
                    : undefined
            };
            const { apiKey: newApiKey, metadata: newMetadata } = await this.create(`Rotated: ${oldMetadata?.name}`, newKeyMetadata);
            if (options?.revokeOld) {
                await this.revoke(existingApiKey);
            }
            return { newApiKey, metadata: newMetadata };
        }
        catch (error) {
            this.logger.error('Key rotation failed', 'ApikeyManager', { error });
            throw errorType_1.CustomError.create('Key rotation failed', 500, { error });
        }
    }
    async pruneExpiredKeys() {
        try {
            await this.storageAdapter.prune();
            this.logger.info('Expired API keys pruned', 'ApikeyManager');
        }
        catch (error) {
            this.logger.error('Failed to prune expired kets', 'ApiKEyManager', { error });
            throw errorType_1.CustomError.create('Failed to prune expired keys', 500, { error });
        }
    }
    generateMockToken(apiKey, metadata) {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = metadata.expirestAt || (now + (24 * 60 * 60));
        return {
            aud: process.env.FIREBASE_PROJECT_ID || 'default-project-id',
            exp: expiresAt,
            iat: now,
            iss: `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID || 'default-project-id'}`,
            sub: metadata.id,
            uid: `apikey-${metadata.id.slice(0, 8)}`,
            acl: metadata.scopes,
            name: metadata.name,
            email: `apikey-${metadata.id.slice(0, 8)}@system.local`,
            auth_time: now,
            firebase: {
                identities: {},
                sign_in_provider: metadata.provider || 'custom',
                token_type: 'api_key',
                api_key_id: metadata.id
            },
            ...(metadata.additionalClaims || {})
        };
    }
    generateSecureApiKey() {
        return `sk_${crypto.randomBytes(16).toString('hex')}`;
    }
}
exports.ApikeyManager = ApikeyManager;
exports.ApiKeyManagerInstance = new ApikeyManager();
//# sourceMappingURL=apiKeyManager.js.map