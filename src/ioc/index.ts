import { 
    Container, 
    decorate, 
    injectable, 
    named} from "inversify";
import { Controller } from "tsoa";
import { ContainerAdapter, IoCSetup } from "./iocConfig";
import { ApiApp } from "../routes";
import { buildProviderModule } from "inversify-binding-decorators";
import { ModelManager } from "../validation/validationModel";
import { Server } from "../server/server";
import { ApiKeyManager } from "../services/apiKeyManager";
import { CustomError } from "../utility/errorType";
import { App } from "../app";
import { CustomLogger } from '../utility/loggerType';
import { AuthStrategyFactory } from "../auth/strategyAuth";

// Create container instance
export const container = new Container();
// Create ContainerAdapter instance
export const iocContainer = new ContainerAdapter(container);

// Decoraate ContainerAdapter instance
decorate(injectable(), Controller);

function setupIoC() {
    try {

        const logger = new CustomLogger({
            logLevel: 'debug'
        });

        if (!container.isBound(CustomLogger)) {
            container.bind(CustomLogger).toConstantValue(logger);
        }

        
        logger.debug('Starting IoC container setup', 'IoC-Setup');

        //bing Firebase-related dependencies with logging
        logger.debug('Setting up Firebase dependencies', 'IoC-Setup');
        IoCSetup(container, {
            apiKeys: [],
            needAdminPrivileges: false
        }, logger);

        // Bind Auth-related dependencies
        logger.debug('Binding AuthStrategyFactory', 'IoC-Setup');
        if (!container.isBound(AuthStrategyFactory)) {
        container.bind(AuthStrategyFactory).toSelf().inSingletonScope();;
        }
        // Bind core services
        logger.debug('Binding core services', 'IoC-Setup', {
            services: ['ModelManager', 'ApiKeyManager', 'Server']
        });

        if (!container.isBound(ModelManager)) {
            container.bind(ModelManager).toSelf();
        }
        if (!container.isBound(ApiKeyManager)) {
            container.bind(ApiKeyManager).toSelf();
        }
        if (!container.isBound(Server)) {
            container.bind(Server).toSelf();
        }
       

        // 6. Bind API and App components
        logger.debug('Binding API and App components', 'IoC-Setup');
        logger.debug('Binding API and App components', 'IoC-Setup');
        if (!container.isBound(ApiApp)) {
            container.bind(ApiApp).toSelf();
        }
        if (!container.isBound(App)) {
            container.bind(App).toSelf();
        }

        // 7. Load any additional providers
        logger.debug('Loading provider module', 'IoC-Setup');
        container.load(buildProviderModule());

        logger.info('IoC container setup completed successfully', 'IoC-Setup');
        
    } catch (error) {
        const logger = container.isBound(CustomLogger)
            ? container.get(CustomLogger)
            : new CustomLogger({ logLevel: 'error' });

        logger.error(
            'Failed to setup IoC container',
            'IoC-Setup-Error',
            {
                error: error instanceof Error
                ? {
                    message: error.message, 
                    stack: error.stack,
                    name: error.name
                }: error
            }
        );

        throw CustomError.create(
            'Failed to setup IoC container',
            500,
            { error }
        );
    }
}


setupIoC();

export function loadProviderModule() {
        // Maybe do additional setup here if needed

    }



