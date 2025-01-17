import { Container, interfaces } from 'inversify';
import { CustomLogger } from '../utility/loggerType';
import { IoCSetupResult, SecurityScopes } from '../utility/firebaseType';
import { IocContainer } from '@tsoa/runtime';
export declare class ContainerAdapter implements IocContainer {
    private readonly container;
    constructor(container: Container);
    get<T>(controller: interfaces.ServiceIdentifier<T> | {
        prototype: T;
    }): T;
    private getControllerIdentifier;
}
export declare function IoCSetup(iocContainer: Container, options: {
    apiKeys?: Array<{
        name: string;
        scopes?: SecurityScopes[];
        expiresAt?: number;
    }>;
    needAdminPrivileges?: boolean;
} | undefined, logger: CustomLogger): Promise<IoCSetupResult>;
