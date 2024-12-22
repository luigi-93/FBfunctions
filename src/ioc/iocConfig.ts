import { Container } from 'inversify';
import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '../auth/setAuth';
import { CustomLogger } from '../utility/loggerType';
import { ApiKeyAuthstrategy, 
        FirebaseJwtAuthStrategy } 
        from '../auth/strategyAuth';
import { SecurityScopes } from '../utility/firebaseType';
import { ApikeyManager } from '../services/apiKeyManager';
import { IocContainer } from '@tsoa/runtime';
import { CustomError } from '../utility/errorType';


export class ContainerAdapter implements IocContainer {
    constructor(private container: Container) {}

        get<T>(controller: { prototype: T } | symbol ): T  {
            try {
                if(typeof controller === 'symbol') {
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
                )
            }
    }

}

export const registry = {
    FirebaseAdmin: Symbol.for('FirebaseAdmin'),
    FirebaseJwtAuthStrategy: Symbol.for('FirebaseJwtAuthStrategy'),
    ApiKeyAuthStrategy: Symbol.for('ApiKeyAuthStrategy'),

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


    // Bind Firebase JWT
    iocContainer
        .bind(registry.FirebaseJwtAuthStrategy)
        .toDynamicValue(() => {
            const firebaseAdmin = iocContainer.get<typeof admin>(registry.FirebaseAdmin);
            return new FirebaseJwtAuthStrategy(firebaseAdmin, logger);
        })
        .inSingletonScope();

    // API key Management setup
    const apiKeyManager = new ApikeyManager();

    // Dynamic API key registration
    // const registeredApikey = options.apiKeys?.map(keyConfig => {
    //     apiKeyManager.create(keyConfig.name, {
    //         scopes: keyConfig.scopes || [SecurityScopes.User],
    //         expiresAt: keyConfig.expiresAt
    //     });
    // });

    // Bind API Key Auth Strategy
    iocContainer
    .bind(registry.ApiKeyAuthStrategy)
    .toDynamicValue(() => new ApiKeyAuthstrategy(apiKeyManager, logger));

    //an optional return with API registered if could be essential somewehre else
    return {
        apiKeyManager
        
    }
}