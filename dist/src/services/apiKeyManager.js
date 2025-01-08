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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyManager = void 0;
const inversify_1 = require("inversify");
const errorType_1 = require("../utility/errorType");
const firebaseType_1 = require("../utility/firebaseType");
const loggerType_1 = require("../utility/loggerType");
const validationApiKey_1 = require("../validation/validationApiKey");
const crypto = __importStar(require("crypto"));
let ApiKeyManager = class ApiKeyManager {
    constructor(logger, storageAdapter, validator) {
        this.logger = logger;
        this.storageAdapter = storageAdapter;
        this.validator = validator;
        this.keyRotationInterval = 30 * 24 * 60 * 60;
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
            this.logger.error('Failed to create API key', 'ApiKeyManager', {
                errorDetails: error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                    }
                    : 'Unknown error',
                keyName: name
            });
            throw errorType_1.CustomError.create('Failed to create API key', 500, { error });
        }
    }
    async get(apiKey) {
        try {
            const metadata = await this.storageAdapter.get(apiKey);
            if (!metadata) {
                this.logger.warn('API key not found', 'ApiKeyManager', {
                    keyId: apiKey.slice(0, 4) + '****'
                });
                throw errorType_1.CustomError.create('API key not found', 404, { keyId: apiKey.slice(0, 4) + '****' });
            }
            if (!this.validator.validate(metadata)) {
                this.logger.warn('API key validation failed', 'ApiKeyManager', {
                    keyId: apiKey.slice(0, 4) + '****'
                });
                throw errorType_1.CustomError.create('API key validation failed', 401, { keyId: apiKey.slice(0, 4) + '****' });
            }
            return metadata;
        }
        catch (error) {
            this.logger.error('Error retrieving API key', 'ApiKeyManager', {
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
                this.logger.info('API key revoked', 'ApiKeyManager', {
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
            this.logger.error('Key rotation failed', 'ApiKeyManager', { error });
            throw errorType_1.CustomError.create('Key rotation failed', 500, { error });
        }
    }
    async pruneExpiredKeys() {
        try {
            await this.storageAdapter.prune();
            this.logger.info('Expired API keys pruned', 'ApiKeyManager');
        }
        catch (error) {
            this.logger.error('Failed to prune expired keys', 'ApiKeyManager', { error });
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
};
exports.ApiKeyManager = ApiKeyManager;
exports.ApiKeyManager = ApiKeyManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)),
    __param(1, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.STORAGE_ADAPTER)),
    __param(2, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.API_KEY_VALIDATOR)),
    __metadata("design:paramtypes", [loggerType_1.CustomLogger, Object, validationApiKey_1.ApiKeyValidator])
], ApiKeyManager);
//# sourceMappingURL=apiKeyManager.js.map