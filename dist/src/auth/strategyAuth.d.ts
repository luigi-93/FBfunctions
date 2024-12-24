import { IAuthStrategy, StrategyName } from '../utility/firebaseType';
import { CustomLogger } from '../utility/loggerType';
import express from 'express';
import { AuthenticatedUser } from './userAuth';
import * as admin from 'firebase-admin';
import { ApikeyManager } from '../services/apiKeyManager';
import { ContainerAdapter } from '../ioc/iocConfig';
export declare class AuthStrategyFactory {
    private container;
    constructor(container: ContainerAdapter);
    getStrategy(name: StrategyName): IAuthStrategy;
}
export declare abstract class BaseAthStrategy implements IAuthStrategy {
    protected logger: CustomLogger;
    constructor(logger?: CustomLogger);
    abstract authenticate(request: express.Request, securityName: string, scopes: string[]): Promise<AuthenticatedUser>;
    protected validateScopes(user: AuthenticatedUser, request: express.Request, requiredScopes: string[]): void;
}
export declare class FirebaseJwtAuthStrategy extends BaseAthStrategy {
    private firebaseAdmin;
    constructor(firebaseAdmin: typeof admin, logger?: CustomLogger);
    authenticate(request: express.Request, securityName: string, scopes?: string[]): Promise<AuthenticatedUser>;
    private extraBearerToken;
    private validateSecurityName;
    private verifyFirebaseToken;
    private handleAuthenticationError;
    refreshToken(token: string): Promise<string>;
}
export declare class ApiKeyAuthstrategy extends BaseAthStrategy {
    private apiKeyManager;
    constructor(apiKeyManager: ApikeyManager, logger?: CustomLogger);
    authenticate(request: express.Request, securityName: string, scopes?: string[]): Promise<AuthenticatedUser>;
    private extractApiKey;
    private validateApiKey;
    private generateMockToken;
    private maskApiKey;
}
