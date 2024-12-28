import { Container } from 'inversify';
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


export class ContainerAdapter implements IocContainer {
    constructor(private container: Container) {}

        get<T>(controller: { prototype: T } | symbol ): T  {
            try {
                if(typeof controller === 'symbol') {
                    const dummyController = {
                        prototype: {} as T,
                        constructor: controller
                    }
                    return this.container.get<T>(controller)
                }
                return this.container.get<T>(controller.constructor as any);
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

        getBySymbol<T>(symbol: symbol): T {
            return this.container.get<T>(symbol);
        }

}


export function IoCSetup(
    iocContainer: Container, 
    options: {
        apiKeys?: { 
            name: string, 
            scopes?: SecurityScopes[], 
            expiresAt?: number 
        }[],
        needAdminPrivileges?: boolean
    } = {
         apiKeys: [],
         needAdminPrivileges: false
    }
    ) {

    //Destructure options at the beginning
    const { apiKeys = [], needAdminPrivileges = false } = options;

    iocContainer
        .bind(CustomLogger)
        .toSelf()
        .inSingletonScope();

    const logger = iocContainer.get(CustomLogger);

    //Bind Firebase Admin
    iocContainer
    .bind(registry.FirebaseAdmin)
    .toDynamicValue(() => initializeFirebaseAdmin(needAdminPrivileges))
    .inSingletonScope();

    iocContainer
        .bind(ApiKeyManager)
        .toSelf()
        .inSingletonScope();

    const apiKeyManager = iocContainer.get(ApiKeyManager);
    
    // Bind Firebase JWT
    iocContainer
        .bind(registry.FirebaseJwtAuthStrategy)
        .toDynamicValue(() => {
            const firebaseAdmin = iocContainer.get<typeof admin>(registry.FirebaseAdmin);
            return new FirebaseJwtAuthStrategy(firebaseAdmin, logger);
        })
        .inSingletonScope();

    // API key Management setup
    

    // Bind API Key Auth Strategy
    iocContainer
        .bind(registry.ApiKeyAuthStrategy)
        .toDynamicValue(() => new ApiKeyAuthstrategy(apiKeyManager, logger))
        .inSingletonScope();

    iocContainer.bind(ModelManager).toSelf().inSingletonScope();
    iocContainer.bind(Server).toSelf().inSingletonScope();
    iocContainer.bind(ApiApp).toSelf().inSingletonScope();
    iocContainer.bind(App).toSelf().inSingletonScope();

    //an optional return with API registered if could be essential somewehre else
    return {
        apiKeyManager
        
    }
}