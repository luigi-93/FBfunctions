import { Container, interfaces } from 'inversify';
import { CustomLogger } from '../utility/loggerType';
import { SecurityScopes, SYMBOLS } from '../utility/firebaseType';
import { ApiKeyManager } from '../services/apiKeyManager';
import { IocContainer } from '@tsoa/runtime';
import { CustomError } from '../utility/errorType';
import { ApiKeyValidator } from '../validation/validationApiKey';
import { InMemoryStorageAdapter } from '../services/apiKeyStorage';


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

interface IoCSetupResult {
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
): IoCSetupResult {
    const { 
        apiKeys = [],
        needAdminPrivileges = false 
    } = options;
    
    logger.debug('Binding ApiKeyManager dependencies', 'IoC-Config');

    if (!iocContainer.isBound(SYMBOLS.API_KEY_VALIDATOR)){
        iocContainer.bind(SYMBOLS.API_KEY_VALIDATOR).to(ApiKeyValidator).inSingletonScope();
    }

    if (!iocContainer.isBound(SYMBOLS.STORAGE_ADAPTER)){
        iocContainer.bind(SYMBOLS.STORAGE_ADAPTER).to(InMemoryStorageAdapter).inSingletonScope();
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
    
        logger.debug(
            'Successfully created ApiKeyManager instance',
            'IoC-Config',
            {
                apiKeyManager: manager
            }
        );
        return { apiKeyManager: manager };

    } catch (error) {  
        logger.error(
            'Failed to create ApiKeyManager',
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
            'Failed to create ApiKeyManager',
            500,
            { error }
        );
    }

    
}