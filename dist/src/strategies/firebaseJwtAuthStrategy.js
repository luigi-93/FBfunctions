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
exports.FirebaseJwtAuthStrategy = void 0;
const customError_1 = require("../errors/customError");
const strategyHelpers_1 = require("./strategyHelpers");
const inversify_1 = require("inversify");
const customLogger_1 = require("../logging/customLogger");
const userAuth_1 = require("../auth/userAuth");
let FirebaseJwtAuthStrategy = class FirebaseJwtAuthStrategy extends strategyHelpers_1.BaseAuthStrategy {
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
            throw customError_1.CustomError.create('No bearer token provided', 401, { reason: 'Missing Authorization header' });
        }
        return bearerToken;
    }
    validateSecurityName(securityName) {
        if (securityName !== 'JWT') {
            throw customError_1.CustomError.create('Invalid security name', 401, { securityName });
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
            throw customError_1.CustomError.create('Token verification failed', 403, {
                reason: 'Invalid Firebase token',
                error: error
            });
        }
    }
    handleAuthenticationError(error) {
        if (error instanceof customError_1.CustomError) {
            throw error;
        }
        const errorMessage = error instanceof Error
            ? error.message
            : 'Uknow validation error';
        if (errorMessage.includes('ID token has expired')) {
            throw customError_1.CustomError.create('Token expired', 401, { reason: 'Firebase ID token has expired' });
        }
        if (errorMessage.includes('Firebase ID token has incorrect')) {
            throw customError_1.CustomError.create('Invalid token', 403, { reason: 'Firebase ID token is incorrect' });
        }
        throw customError_1.CustomError.create('Authentication failed', 403, {
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
            throw customError_1.CustomError.create('Token refresh failed', 403, { reason: 'Unable to refresh token' });
        }
    }
};
exports.FirebaseJwtAuthStrategy = FirebaseJwtAuthStrategy;
exports.FirebaseJwtAuthStrategy = FirebaseJwtAuthStrategy = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [Object, customLogger_1.CustomLogger])
], FirebaseJwtAuthStrategy);
//# sourceMappingURL=firebaseJwtAuthStrategy.js.map