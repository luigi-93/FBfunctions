import { Container } from 'inversify';
import { SecurityScopes } from '../utility/firebaseType';
import { ApikeyManager } from '../services/apiKeyManager';
import { IocContainer } from '@tsoa/runtime';
export declare class ContainerAdapter implements IocContainer {
    private container;
    constructor(container: Container);
    get<T>(controller: {
        prototype: T;
    }): T | Promise<T>;
}
export declare const registry: {
    FirebaseAdmin: symbol;
    FirebaseJwtAuthStrategy: symbol;
    ApiKeyAuthStrategy: symbol;
};
export declare function IoCSetup(iocContainer: Container, options?: {
    apiKeys?: {
        name: string;
        scopes?: SecurityScopes[];
        expiresAt?: number;
    }[];
    needAdminPrivileges?: boolean;
}): {
    apiKeyManager: ApikeyManager;
    registeredApikey: void[] | undefined;
};
