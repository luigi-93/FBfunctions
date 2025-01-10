import { Container, interfaces } from 'inversify';
import { CustomLogger } from '../utility/loggerType';
import { SecurityScopes } from '../utility/firebaseType';
import { ApiKeyManager } from '../services/apiKeyManager';
import { IocContainer } from '@tsoa/runtime';
export declare class ContainerAdapter implements IocContainer {
    private readonly container;
    constructor(container: Container);
    get<T>(controller: {
        prototype: T;
    }): T;
    get<T>(controller: {
        prototype: T;
    }): Promise<T>;
    get<T>(controller: interfaces.ServiceIdentifier<T>): T;
    private getControllerIdentifier;
}
interface ApiKeyResult {
    name: string;
    key: string;
    scopes: SecurityScopes[];
    expiresAt?: number;
}
interface IoCSetupResult {
    apiKeyManager: ApiKeyManager;
    generatedKeys: ApiKeyResult[];
}
export declare function IoCSetup(iocContainer: Container, options: {
    apiKeys?: Array<{
        name: string;
        scopes?: SecurityScopes[];
        expiresAt?: number;
    }>;
    needAdminPrivileges?: boolean;
} | undefined, logger: CustomLogger): Promise<IoCSetupResult>;
export {};
