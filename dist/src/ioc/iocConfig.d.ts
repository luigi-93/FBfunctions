import { Container } from 'inversify';
import { SecurityScopes } from '../utility/firebaseType';
import { ApiKeyManager } from '../services/apiKeyManager';
import { IocContainer } from '@tsoa/runtime';
export declare class ContainerAdapter implements IocContainer {
    private container;
    constructor(container: Container);
    get<T>(controller: {
        prototype: T;
    } | symbol): T;
    getBySymbol<T>(symbol: symbol): T;
}
export declare function IoCSetup(iocContainer: Container, options?: {
    apiKeys?: {
        name: string;
        scopes?: SecurityScopes[];
        expiresAt?: number;
    }[];
    needAdminPrivileges?: boolean;
}): {
    apiKeyManager: ApiKeyManager;
};
