import { 
    Container, 
    decorate, 
    injectable } from "inversify";
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

        // First bind CustomerLogger as it's a fundamental dependency
        container.bind(CustomLogger).toSelf().inSingletonScope();  

        // Get logger instance for setup logging
        const logger = container.get(CustomLogger);
        
        // Bind Firebaserelated dedendencies
        IoCSetup(container, {
            apiKeys: [],
            needAdminPrivileges: false
        });

        // Bind Auth-related dependencies
        container.bind(AuthStrategyFactory).toSelf().inSingletonScope();;

        // Bind core services
        container.bind(ModelManager).toSelf();
        container.bind(ApiKeyManager).toSelf();
        container.bind(Server).toSelf();

        // 6. Bind API and App components
        container.bind(ApiApp).toSelf();
        container.bind(App).toSelf();

        // 7. Load any additional providers
        container.load(buildProviderModule());

        logger.info('IoC container setup completed');
        
    } catch (error) {
        console.error('Ioc setup error:', error)
        throw CustomError.create(
            'Failed to setup IoC container',
            500,
            { error }
        )
    }
}


setupIoC();

export function loadProviderModule() {
        // Maybe do additional setup here if needed

    }



