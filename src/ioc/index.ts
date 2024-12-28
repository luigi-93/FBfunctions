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
import { CustomLogger } from "../utility/loggerType";
import { AuthStrategyFactory } from "../auth/strategyAuth";

export const container = new Container();
export const iocContainer = new ContainerAdapter(container);

decorate(injectable(), Controller);

function setupIoC() {
    try {

        container.bind(CustomLogger).toSelf().inSingletonScope();

        IoCSetup(container, {
            apiKeys: [],
            needAdminPrivileges: false
        });

        container.bind(AuthStrategyFactory).toSelf().inSingletonScope();;

        // Bind all required dependencies
        container.bind(ModelManager).toSelf();
        container.bind(ApiKeyManager).toSelf();
        container.bind(Server).toSelf();
        container.bind(ApiApp).toSelf();
        container.bind(App).toSelf();

        container.load(buildProviderModule());
        
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



