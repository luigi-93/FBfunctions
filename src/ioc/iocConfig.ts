import { Container } from 'inversify';
import * as admin from 'firebase-admin';
import { initializeFirebaseAdmin } from '../auth/setAuth';
import { CustomLogger } from '../utility/loggerType';
import { ApiKeyAuthstrategy, 
        FirebaseJwtAuthStrategy } 
        from '../auth/strategyAuth';
import { SecurityScopes } from '../utility/firebaseType';
import { ApikeyManager } from '../services/apiKeyManager';


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
    const logger = new CustomLogger();
     const {
         apiKeys = [],
         needAdminPrivileges = false
     } = options;

    //Bind Firebase Admin
    iocContainer
    .bind(registry.FirebaseAdmin)
    .toDynamicValue(() => initializeFirebaseAdmin(needAdminPrivileges))
    .inSingletonScope();


    // Bind Firebase JWT
    iocContainer
    .bind(registry.FirebaseJwtAuthStrategy).
    toDynamicValue(() => {
        const firebaseAdmin = iocContainer.get<typeof admin>(registry.FirebaseAdmin);
        return new FirebaseJwtAuthStrategy(firebaseAdmin, logger);
    });

    // API key Management setup
    const apiKeyManager = new ApikeyManager();

    // Dynamic API key registration
    const registeredApikey = options.apiKeys?.map(keyConfig => {
        apiKeyManager.create(keyConfig.name, {
            scopes: keyConfig.scopes || [SecurityScopes.User],
            expiresAt: keyConfig.expiresAt
        });
    });

    // Bind API Key Auth Strategy
    iocContainer
    .bind(registry.ApiKeyAuthStrategy)
    .toDynamicValue(() => new ApiKeyAuthstrategy(apiKeyManager, logger));

    //an optional return with API registered if could be essential somewehre else
    return {
        apiKeyManager,
        registeredApikey
    }
}