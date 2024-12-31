import { Container, interfaces } from 'inversify';
import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '../auth/setAuth';
import { CustomLogger } from '../utility/loggerType';
import { ApiKeyAuthstrategy, 
        FirebaseJwtAuthStrategy } 
        from '../auth/strategyAuth';
import { registry, SecurityScopes } from '../utility/firebaseType';
import { ApiKeyManager } from '../services/apiKeyManager';
import { IocContainer } from '@tsoa/runtime';
import { CustomError } from '../utility/errorType';
import { ModelManager } from '../validation/validationModel';
import { Server } from '../server/server';
import { ApiApp } from '../routes';
import { App } from '../app';
import { log } from 'console';


export class ContainerAdapter implements IocContainer {
    constructor(private container: Container) {}

    get<T>(controller: { prototype: T }): T;
    get<T>(controller: { prototype: T }): Promise<T>;
    get<T>(controller: interfaces.ServiceIdentifier<T>): T;
    get<T>(controller: interfaces.ServiceIdentifier<T> | { prototype: T }): T | Promise<T> {
        try {
            if (typeof controller === 'symbol' || typeof controller === 'function') {
                return this.container.get<T>(controller as interfaces.ServiceIdentifier<T>);
            }
            return this.container.get<T>((controller as { prototype: T }).constructor as interfaces.ServiceIdentifier<T>);
        } catch (error) {
            throw CustomError.create(
                'Dependency not found',
                500,
                { 
                    controller: controller.toString(),
                    originalError: error instanceof Error ? error.message : 'Unknown error'
                }
            );
        }
    }
}

interface IoCSetupeResult {
    apiKeyManager: ApiKeyManager;
}


export function IoCSetup(
    iocContainer: Container, 
    options: {
        apiKeys?: Array<{ 
            name: string, 
            scopes?: SecurityScopes[], 
            expiresAt?: number 
        }>;
        needAdminPrivileges?: boolean;
    } = {
         apiKeys: [],
         needAdminPrivileges: false
    },
    logger: CustomLogger
): IoCSetupeResult {
    const { apiKeys = [], needAdminPrivileges = false } = options;
    
    logger.debug('Starting IoCSetup', 'IoC-Config');

    //Bind Firebase Admin
    logger.debug('Binding Firebase Admin', 'IoC-Config', {
        needAdminPrivileges
    });
    iocContainer
        .bind(registry.FirebaseAdmin)
        .toDynamicValue(() => initializeFirebaseAdmin(needAdminPrivileges))
        .inSingletonScope();

    // Bind ApiKeyManager
    logger.debug('Binding ApiKeyManager', 'IoC-Config');
    iocContainer
        .bind(ApiKeyManager)
        .toSelf()
        .inSingletonScope();

    const apiKeyManager = iocContainer.get(ApiKeyManager);

    // Auth strategies binding
    logger.debug('Binding Auth Strategies', 'IoC-Config');
    try {
        iocContainer
            .bind(registry.FirebaseJwtAuthStrategy)
            .toDynamicValue(() => {
                const firebaseAdmin = iocContainer.get<typeof admin>(registry.FirebaseAdmin);
                return new FirebaseJwtAuthStrategy(firebaseAdmin, logger);
            })
            .inSingletonScope();

        iocContainer
            .bind(registry.ApiKeyAuthStrategy)
            .toDynamicValue(() => new ApiKeyAuthstrategy(apiKeyManager, logger))
            .inSingletonScope();
    } catch (error) {
        logger.error(
            'Failed to bind Auth Strategies',
            'IoC-Config',
            {
                error: error instanceof Error 
                    ? error.message
                    : 'Unknown error',
            }
        );
        throw error;
    }
    
    // Bind core services
    logger.debug('Binding core services', 'IoC-Config');
    iocContainer.bind(ModelManager).toSelf().inSingletonScope();
    iocContainer.bind(Server).toSelf().inSingletonScope();
    iocContainer.bind(ApiApp).toSelf().inSingletonScope();
    iocContainer.bind(App).toSelf().inSingletonScope();

    logger.info('IoCSetup completed successfully', 'IoC-Config');

    return { apiKeyManager };
}