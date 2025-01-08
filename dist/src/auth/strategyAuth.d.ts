import { IAuthStrategy, StrategyName } from '../utility/firebaseType';
import { CustomLogger } from '../utility/loggerType';
import express from 'express';
import { AuthenticatedUser } from './userAuth';
import * as admin from 'firebase-admin';
import { ApiKeyManager } from '../services/apiKeyManager';
export declare class AuthStrategyFactory {
    private logger;
    constructor(logger: CustomLogger);
    getStrategy(name: StrategyName): IAuthStrategy;
}
export declare abstract class BaseAuthStrategy implements IAuthStrategy {
    protected logger: CustomLogger;
    constructor(logger?: CustomLogger);
    abstract authenticate(request: express.Request, securityName: string, scopes: string[]): Promise<AuthenticatedUser>;
    protected validateScopes(user: AuthenticatedUser, request: express.Request, requiredScopes: string[]): void;
}
export declare class FirebaseJwtAuthStrategy extends BaseAuthStrategy {
    private firebaseAdmin;
    constructor(firebaseAdmin: typeof admin, logger?: CustomLogger);
    authenticate(request: express.Request, securityName: string, scopes?: string[]): Promise<AuthenticatedUser>;
    private extraBearerToken;
    private validateSecurityName;
    private verifyFirebaseToken;
    private handleAuthenticationError;
    refreshToken(token: string): Promise<string>;
}
export declare class ApiKeyAuthstrategy extends BaseAuthStrategy {
    private apiKeyManager;
    constructor(apiKeyManager: ApiKeyManager, logger?: CustomLogger);
    authenticate(request: express.Request, securityName: string, scopes?: string[]): Promise<AuthenticatedUser>;
    private extractApiKey;
    private validateApiKey;
    private generateMockToken;
    private maskApiKey;
}
