import { Container } from 'inversify';
import { ApiKeyResult, IoCSetupResult, registry, SecurityScopes, SYMBOLS } from '../utility/firebaseType';
import { ApiKeyManager } from '../services/apiKeyManager';
import { CustomError } from '../errors/customError';
import { ApiKeyValidator } from '../validation/validationApiKey';
import { InMemoryStorageAdapter } from '../services/apiKeyStorage';
import { initializeFirebaseAdmin } from '../auth/setAuth';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import * as admin from 'firebase-admin';
import { CustomLogger } from '../logging/customLogger';
import { FirebaseJwtAuthStrategy } from '../strategies/firebaseJwtAuthStrategy';
import { FirebaseApiKeyAuthStrategy } from '../strategies/firebaseApiKeyAuthStrategy';
import { ContainerAdapter } from './iocHelpers';


export async function IoCSetup(
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
): Promise<IoCSetupResult> {
    const { 
        apiKeys = [],
        needAdminPrivileges = false 
    } = options;

    logger.debug('Setting up Firebase dependencies', 'IoC-Config');
    try {
        // Bind Firebase Admin
        iocContainer
            .bind(registry.FirebaseAdmin)
            .toDynamicValue(() => initializeFirebaseAdmin(needAdminPrivileges))
            .inSingletonScope();
        
        //Bind Firebase JWT Auth Strategy
        iocContainer
            .bind(registry.FirebaseJwtAuthStrategy)
            .toDynamicValue((context) => {
                try {
                    const firebaseAdmin = context.container.get<typeof admin>(registry.FirebaseAdmin);
                    const strategyLogger = context.container.get<CustomLogger>(SYMBOLS.CUSTOM_LOGGER);
                    return new FirebaseJwtAuthStrategy(firebaseAdmin, strategyLogger);
                } catch (error) {
                    logger.error(
                        'Failed to initialize Firebase Jwt Authentication Strategy',
                        'IoC-Config',
                        { error });
                    throw CustomError.create(
                        'Failed to initialize Firebase Jwt Authentication Strategy',
                        500,
                        //da aggiungere più dettagli 
                        { error })
                }
            })
            .inSingletonScope();

            logger.debug(
                'Successfully bind Firebase JWT Auth Strategy',
                'IoC-Config',)
                
    } catch (error) {
        logger.error(
            'Failed to setup Firebase Authentication dependencies',
            'IoC-Config',
            { errorDetails: error instanceof Error
                ? {
                    errorMessage: error.message,
                    errorName: error.name
                }
                : 'Unknown error',                
            });
        throw CustomError.create(
            'Failed to setup Firebase Authentication dependencies',
            500,
            { error });
    }
    
    logger.debug('Binding ApiKeyManager dependencies', 'IoC-Config');

    if (!iocContainer.isBound(SYMBOLS.API_KEY_VALIDATOR)){
        iocContainer
            .bind(SYMBOLS.API_KEY_VALIDATOR)
            .to(ApiKeyValidator)
            .inSingletonScope();
    }

    if (!iocContainer.isBound(SYMBOLS.STORAGE_ADAPTER)){
        iocContainer    
            .bind(SYMBOLS.STORAGE_ADAPTER)
            .to(InMemoryStorageAdapter)
            .inSingletonScope();
    }

    if (!iocContainer.isBound(SYMBOLS.CONTAINER_ADAPTER)) {
        iocContainer
            .bind(SYMBOLS.CONTAINER_ADAPTER)
            .to(ContainerAdapter)
            .inSingletonScope();
    }

    try {
        logger.debug('Binding ApiKeyManager', 'IoC-Config');

        if (!iocContainer.isBound(SYMBOLS.API_KEY_MANAGER)) {
        iocContainer
            .bind(SYMBOLS.API_KEY_MANAGER)
            .to(ApiKeyManager)
            .inSingletonScope();
        }

        const manager = iocContainer.get<ApiKeyManager>(SYMBOLS.API_KEY_MANAGER);
        const generatedKeys: ApiKeyResult[] = [];

        await Promise.all(apiKeys.map(async (keyConfig) => {
            const keyResult = await manager.create(keyConfig.name, {
                scopes: keyConfig.scopes || [SecurityScopes.User],
                expiresAt: keyConfig.expiresAt
            });

            generatedKeys.push({
                name: keyConfig.name,
                key: keyResult.apiKey,
                scopes: keyResult.metadata.scopes,
                expiresAt: keyResult.metadata.expiresAt
            });
            
        }));
 
        logger.debug(
            'Successfully created ApiKeyManager instance',
            'IoC-Config',
            {
                apiKeyManager: manager,
                generatedKeys: generatedKeys.length
            }
        );

        logger.debug('Binding firebase API key Auth Strategy', 'IoC-Config');
        iocContainer
            .bind(registry.FirebaseApiKeyAuthStrategy)
            .toDynamicValue((context) => {
                try {
                    const strategyLogger = context.container.get<CustomLogger>(SYMBOLS.CUSTOM_LOGGER);
                    return new FirebaseApiKeyAuthStrategy(manager, strategyLogger);
                } catch (error) {
                    logger.error(
                        'Failed to initialize firebase API key Auth Strategy',
                        'IoC-Config',
                        { 
                            errorDetails: error instanceof Error
                            ? {
                                name: error.name,
                                message: error.message
                            }
                            : 'Unknow error'
                         });
                    throw CustomError.create(
                        'Failed to initialize firebase API key Auth Strategy',
                        500,
                        //da aggiungere più dettagli 
                        { error })
                }
                
            })
            .inSingletonScope();
        
        logger.debug(
            'Successfully binded firebase API key Auth Strategy', 
            'IoC-Config');

        try {
            logger.debug('Binding AuthStrategyFactory', 'IoC-Config');
            iocContainer
                .bind(SYMBOLS.AUTH_STRATEGY_FACTORY)
                .to(AuthStrategyFactory)
                .inSingletonScope();

            logger.debug(
                'Successfully binded AuthStrategyFactory', 
                'IoC-Config');
        
        
        } catch (error) {
            logger.error(
                'Failed to bind AuthStrategyFactory',
                'IoC-Config',
                { errorDetails: error instanceof Error
                    ? {
                        errorMessage: error.message,
                        errorName: error.name
                    }
                    : 'Unknown error',                
                }
            );
            throw CustomError.create(
                'Failed to bind AuthStrategyFactory',
                500,
                { error }
            );

        }

        return { 
            apiKeyManager: manager,
            generatedKeys
        };

    } catch (error) {  
        logger.error(
            'Failed to bind ApiKeyManager',
            'IoC-Config',
            { errorDetails: error instanceof Error
                ? {
                    errorMessage: error.message,
                    errorName: error.name
                }
                : 'Unknown error',                
            }
        );
        throw CustomError.create(
            'Failed to bind ApiKeyManager',
            500,
            { error }
        );
    }
}
    

    
