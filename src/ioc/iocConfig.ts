import { Container, injectable, interfaces } from 'inversify';
import { CustomLogger } from '../utility/loggerType';
import { registry, SecurityScopes, SYMBOLS } from '../utility/firebaseType';
import { ApiKeyManager } from '../services/apiKeyManager';
import { IocContainer } from '@tsoa/runtime';
import { CustomError } from '../utility/errorType';
import { ApiKeyValidator } from '../validation/validationApiKey';
import { InMemoryStorageAdapter } from '../services/apiKeyStorage';
import { ServerConfig } from '../config/servConfig';
import { initializeFirebaseAdmin } from '../auth/setAuth';
import { ApiKeyAuthstrategy, AuthStrategyFactory, FirebaseJwtAuthStrategy } from '../auth/strategyAuth';
import * as admin from 'firebase-admin';


@injectable()
export class ContainerAdapter implements IocContainer {
    constructor(private readonly container: Container) {
        if (!container) {
            throw CustomError.create(
                'Container instance is required',
                500,
                {
                    details: 'Container was not provided to ContainerAdapter'
                }
            );
        }
    }

    get<T>(controller: { prototype: T }): T;
    get<T>(controller: { prototype: T }): Promise<T>;
    get<T>(controller: interfaces.ServiceIdentifier<T>): T;
    get<T>(controller: interfaces.ServiceIdentifier<T> | { prototype: T }): T | Promise<T> {
        try {

            if (!controller) {
                throw CustomError.create(
                    'Controller parameter is requireds',
                    500,
                    {
                        message: 'Constroller was not provided'
                    });
            }

            if (typeof controller === 'symbol' || typeof controller === 'function') {
                return this.container.get<T>(controller as interfaces.ServiceIdentifier<T>);
            }
            
            if (typeof controller === 'object' && 'prototype' in controller) {
                const serviceIdentifier = (controller as { prototype: T }).constructor as interfaces.ServiceIdentifier<T>;
            
                if (!serviceIdentifier) {
                    throw CustomError.create(
                        'Invalid controller constructor',
                        500,
                        {
                            message: 'Provide the right controller constructor'
                        });
                }

                return this.container.get<T>(serviceIdentifier)
            }

            throw CustomError.create(
                'Unsupported controller type',
                500,
                {
                    message: 'The type of controller is not supported'
                }
            )
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorDetails = {
                controller: this.getControllerIdentifier(controller),
                originalError: errorMessage
            };

            throw CustomError.create(
                'Dependency resolution failed',
                500,
                errorDetails
            );
        }
    }

    private getControllerIdentifier(controller: any): string {
        if (typeof controller === 'symbol') {
            return controller.toString()
        }
        if (typeof controller === 'function') {
            return controller.name || 'Anonymous Function';
        }
        if (controller?.constructor) {
            return controller.constructor.name || 'Unknown Class';
        }

        return 'Unknow Controller Type'
    }
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
            .toConstantValue(ContainerAdapter)
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

        logger.debug('Binding API key Auth Strategy', 'IoC-Config');
        iocContainer
            .bind(registry.ApiKeyAuthStrategy)
            .toDynamicValue((context) => {
                try {
                    const strategyLogger = context.container.get<CustomLogger>(SYMBOLS.CUSTOM_LOGGER);
                    return new ApiKeyAuthstrategy(manager, strategyLogger);
                } catch (error) {
                    logger.error(
                        'Failed to initialize API key Auth Strategy',
                        'IoC-Config',
                        { error });
                    throw CustomError.create(
                        'Failed to initialize API key Auth Strategy',
                        500,
                        //da aggiungere più dettagli 
                        { error })
                }
                
            })
            .inSingletonScope();
        
        logger.debug(
            'Successfully binded API key Auth Strategy', 
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
    

    
