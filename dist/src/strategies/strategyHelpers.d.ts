import { IAuthStrategy, StrategyName } from '../utility/firebaseType';
import { CustomLogger } from '../logging/customLogger';
import express from 'express';
import { AuthenticatedUser } from '../auth/userAuth';
import { ContainerAdapter } from '../ioc/iocHelpers';
export declare class AuthStrategyFactory {
    private logger;
    private ioc;
    constructor(logger: CustomLogger, ioc: ContainerAdapter);
    getStrategy(name: StrategyName): IAuthStrategy;
}
export declare abstract class BaseAuthStrategy implements IAuthStrategy {
    protected logger: CustomLogger;
    constructor(logger?: CustomLogger);
    abstract authenticate(request: express.Request, securityName: string, scopes: string[]): Promise<AuthenticatedUser>;
    protected validateScopes(user: AuthenticatedUser, request: express.Request, requiredScopes: string[]): void;
}
