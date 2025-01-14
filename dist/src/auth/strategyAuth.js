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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyAuthstrategy = exports.FirebaseJwtAuthStrategy = exports.BaseAuthStrategy = exports.AuthStrategyFactory = void 0;
const inversify_1 = require("inversify");
const firebaseType_1 = require("../utility/firebaseType");
const errorType_1 = require("../utility/errorType");
const loggerType_1 = require("../utility/loggerType");
const userAuth_1 = require("./userAuth");
const apiKeyManager_1 = require("../services/apiKeyManager");
const iocConfig_1 = require("../ioc/iocConfig");
let AuthStrategyFactory = class AuthStrategyFactory {
    constructor(logger, ioc) {
        this.logger = logger;
        this.ioc = ioc;
    }
    getStrategy(name) {
        if (!name) {
            this.logger.warn('Strategy name not provided', 'AuthStrategyFactory');
            throw errorType_1.CustomError.create('strategy name is reuired', 400, { details: 'The strategy name parameter was not provided.' });
        }
        const strategySymbol = firebaseType_1.StrategyRegistry[name];
        if (!strategySymbol) {
            this.logger.warn(`Strategy ${name} not found in registry`, 'AuthStrategyFactory');
            throw errorType_1.CustomError.create(`Authentication strategy ${name} not found`, 403, {
                name,
                availableStrategies: Object.keys(firebaseType_1.StrategyRegistry),
            });
        }
        try {
            const strategy = this.ioc.get(strategySymbol);
            this.logger.info(`Successfully resolved strategy: ${name}`, 'AuthStrategyFactory', { strategyName: name });
            return strategy;
        }
        catch (error) {
            this.logger.error(`Failed to resolve strategy: ${name}`, 'AuthStrategyFactory', {
                errorDetails: error instanceof Error
                    ? error.message
                    : 'Unknown error',
            });
            throw errorType_1.CustomError.create('Failed to initialize authentication strategy', 500, {
                strategy: name,
                error: error instanceof Error
                    ? error.message
                    : 'Unknown error'
            });
        }
    }
};
exports.AuthStrategyFactory = AuthStrategyFactory;
exports.AuthStrategyFactory = AuthStrategyFactory = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)),
    __param(1, (0, inversify_1.inject)(new inversify_1.LazyServiceIdentifier(() => firebaseType_1.SYMBOLS.CONTAINER_ADAPTER))),
    __metadata("design:paramtypes", [loggerType_1.CustomLogger,
        iocConfig_1.ContainerAdapter])
], AuthStrategyFactory);
class BaseAuthStrategy {
    constructor(logger) {
        this.logger = logger || new loggerType_1.CustomLogger();
    }
    validateScopes(user, request, requiredScopes) {
        if (requiredScopes.length === 0) {
            this.logger.debug('No scope validation required', 'BaseAuthStrategy.validateScopes', {
                userId: user.getCustomClaim('uid')
            });
            return;
        }
        this.logger.debug('Starting scope validation', 'BaseAuthStrategy.validateScoopes', {
            requiredScopes,
            userId: user.getCustomClaim('uid')
        });
        user.isAllowedTo(request, {
            requiredScopes: requiredScopes
        });
        this.logger.debug('Scope validation successful', 'BaseAuthStrategy.validateScopes', {
            requiredScopes,
            userId: user.getCustomClaim('uid')
        });
    }
}
exports.BaseAuthStrategy = BaseAuthStrategy;
let FirebaseJwtAuthStrategy = class FirebaseJwtAuthStrategy extends BaseAuthStrategy {
    constructor(firebaseAdmin, logger) {
        super(logger);
        this.firebaseAdmin = firebaseAdmin;
    }
    async authenticate(request, securityName, scopes = []) {
        const bearerToken = this.extraBearerToken(request);
        this.validateSecurityName(securityName);
        try {
            const firebaseTokenParsed = await this.verifyFirebaseToken(bearerToken);
            const authnticatedUser = new userAuth_1.AuthenticatedUser(firebaseTokenParsed);
            this.validateScopes(authnticatedUser, request, scopes);
            return authnticatedUser;
        }
        catch (error) {
            this.handleAuthenticationError(error);
        }
    }
    extraBearerToken(request) {
        const authHeader = request?.headers?.authorization;
        const bearerToken = authHeader?.split('Bearer ')?.[1];
        if (!bearerToken) {
            this.logger.warn('No bearer token', 'FirebaseJwtAuthStrategy');
            throw errorType_1.CustomError.create('No bearer token provided', 401, { reason: 'Missing Authorization header' });
        }
        return bearerToken;
    }
    validateSecurityName(securityName) {
        if (securityName !== 'JWT') {
            throw errorType_1.CustomError.create('Invalid security name', 401, { securityName });
        }
    }
    async verifyFirebaseToken(token) {
        try {
            const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(token, true);
            const extendedToken = {
                ...decodedToken,
                acl: [],
                name: decodedToken.name || 'Uknown User',
                email: decodedToken.email || '',
                firebase: {
                    ...decodedToken.firebase,
                    sign_in_provider: decodedToken.firebase?.sign_in_provider || 'unknown',
                    token_type: 'id_token',
                },
            };
            return extendedToken;
        }
        catch (error) {
            this.logger.error('Firebase token verification failed', 'FirebaseJwtAuthStrategy', {
                errorMessage: error instanceof Error
                    ? error.message
                    : 'Unknow error'
            });
            throw errorType_1.CustomError.create('Token verification failed', 403, {
                reason: 'Invalid Firebase token',
                error: error
            });
        }
    }
    handleAuthenticationError(error) {
        if (error instanceof errorType_1.CustomError) {
            throw error;
        }
        const errorMessage = error instanceof Error
            ? error.message
            : 'Uknow validation error';
        if (errorMessage.includes('ID token has expired')) {
            throw errorType_1.CustomError.create('Token expired', 401, { reason: 'Firebase ID token has expired' });
        }
        if (errorMessage.includes('Firebase ID token has incorrect')) {
            throw errorType_1.CustomError.create('Invalid token', 403, { reason: 'Firebase ID token is incorrect' });
        }
        throw errorType_1.CustomError.create('Authentication failed', 403, {
            reason: errorMessage,
            originalError: error
        });
    }
    async refreshToken(token) {
        try {
            const decodedToken = await this.verifyFirebaseToken(token);
            return await this.firebaseAdmin.auth().createCustomToken(decodedToken.uid);
        }
        catch (error) {
            this.logger.error('Token refresh failed', 'FirebaseJwtAuthStrategy', { error });
            throw errorType_1.CustomError.create('Token refresh failed', 403, { reason: 'Unable to refresh token' });
        }
    }
};
exports.FirebaseJwtAuthStrategy = FirebaseJwtAuthStrategy;
exports.FirebaseJwtAuthStrategy = FirebaseJwtAuthStrategy = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [Object, loggerType_1.CustomLogger])
], FirebaseJwtAuthStrategy);
let ApiKeyAuthstrategy = class ApiKeyAuthstrategy extends BaseAuthStrategy {
    constructor(apiKeyManager, logger) {
        super(logger);
        this.apiKeyManager = apiKeyManager;
    }
    async authenticate(request, securityName, scopes = []) {
        const apikey = this.extractApiKey(request);
        if (!apikey) {
            this.logger.warn('API key extration failed', 'ApiKeyAuth');
            throw errorType_1.CustomError.create('No API key provided', 401, { reason: 'Missing API key' });
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
            this.logger.error('Invalid API key', 'ApiKeyAuthStrategy', {
                keyId: this.maskApiKey(apiKey)
            });
            throw errorType_1.CustomError.create('Authenctication failed', 403, {
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
            throw errorType_1.CustomError.create('Authentication failed', 403, {
                reason: 'API key has expired',
                errorCode: 'API_KEY_EXPIRED'
            });
        }
        if (!keyMetadata.status || keyMetadata.status !== 'ACTIVE') {
            this.logger.warn('Inactive API key', 'ApiKeyAuth', {
                keyId: this.maskApiKey(apiKey),
                status: keyMetadata.status
            });
            throw errorType_1.CustomError.create('Authenrication failed', 403, {
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
exports.ApiKeyAuthstrategy = ApiKeyAuthstrategy;
exports.ApiKeyAuthstrategy = ApiKeyAuthstrategy = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [apiKeyManager_1.ApiKeyManager,
        loggerType_1.CustomLogger])
], ApiKeyAuthstrategy);
//# sourceMappingURL=strategyAuth.js.map