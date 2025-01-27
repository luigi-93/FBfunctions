"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseApiKeyAuthStrategy = void 0;
const apiKeyManager_1 = require("../services/apiKeyManager");
const customError_1 = require("../errors/customError");
const strategyHelpers_1 = require("./strategyHelpers");
const inversify_1 = require("inversify");
const customLogger_1 = require("../logging/customLogger");
const userAuth_1 = require("../auth/userAuth");
let FirebaseApiKeyAuthStrategy = class FirebaseApiKeyAuthStrategy extends strategyHelpers_1.BaseAuthStrategy {
    constructor(apiKeyManager, logger) {
        super(logger);
        this.apiKeyManager = apiKeyManager;
    }
    async authenticate(request, securityName, scopes = []) {
        const apikey = this.extractApiKey(request);
        if (!apikey) {
            this.logger.warn('API key extration failed', 'ApiKeyAuth');
            throw customError_1.CustomError.create('No API key provided', 401, { reason: 'Missing API key' });
        }
        const keyMetadata = await this.validateApiKey(apikey);
        const mockDecodeToken = this.generateMockToken(apikey, keyMetadata);
        const mockUser = new userAuth_1.AuthenticatedUser(mockDecodeToken);
        this.validateScopes(mockUser, request, scopes);
        return mockUser;
    }
    extractApiKey(request) {
        return typeof request.headers['x-api-key'] === 'string'
            ? request.headers['x-api-key']
            : typeof request.query.apiKey === 'string'
                ? request.query.apiKey
                : undefined;
    }
    async validateApiKey(apiKey) {
        const keyMetadata = await this.apiKeyManager.get(apiKey);
        if (!keyMetadata) {
            this.logger.error('Invalid API key', 'FirebaseApiKeyAuthStrategy', {
                keyId: this.maskApiKey(apiKey)
            });
            throw customError_1.CustomError.create('Authenctication failed', 403, {
                reason: 'Unauthorized API key',
                errorCode: 'API_KEY_INVALID'
            });
        }
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (keyMetadata.expiresAt && currentTimestamp > keyMetadata.expiresAt) {
            this.logger.warn('Expired API key', 'ApiKeyAuth', {
                keyId: this.maskApiKey(apiKey),
                expirationTime: keyMetadata.expiresAt
            });
            throw customError_1.CustomError.create('Authentication failed', 403, {
                reason: 'API key has expired',
                errorCode: 'API_KEY_EXPIRED'
            });
        }
        if (!keyMetadata.status || keyMetadata.status !== 'ACTIVE') {
            this.logger.warn('Inactive API key', 'ApiKeyAuth', {
                keyId: this.maskApiKey(apiKey),
                status: keyMetadata.status
            });
            throw customError_1.CustomError.create('Authenrication failed', 403, {
                reason: 'API key is not acitve',
                errorCode: 'API_KEY_INACTIVE'
            });
        }
        return keyMetadata;
    }
    generateMockToken(apiKey, metadata) {
        return this.apiKeyManager.generateMockToken(apiKey, metadata);
    }
    maskApiKey(apiKey) {
        return apiKey.slice(0, 4) + apiKey.slice(-4);
    }
};
exports.FirebaseApiKeyAuthStrategy = FirebaseApiKeyAuthStrategy;
exports.FirebaseApiKeyAuthStrategy = FirebaseApiKeyAuthStrategy = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [apiKeyManager_1.ApiKeyManager,
        customLogger_1.CustomLogger])
], FirebaseApiKeyAuthStrategy);
//# sourceMappingURL=firebaseApiKeyAuthStrategy.js.map