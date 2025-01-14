import { 
    Container, 
    decorate, 
    injectable
} from "inversify";
import { Controller } from "tsoa";
import { ContainerAdapter, IoCSetup } from "./iocConfig";
import { buildProviderModule } from "inversify-binding-decorators";
import { CustomError } from "../utility/errorType";
import { CustomLogger } from '../utility/loggerType';
import { Server } from "../server/server";
import { ApiApp } from "../routes";
import { App } from "../app";
import { SYMBOLS } from "../utility/firebaseType";
import { ServerInitializer } from "../server/serverInitializer";


// Create container instance
export const container = new Container({ defaultScope: 'Singleton' });
// Create ContainerAdapter instance
export const iocContainer = new ContainerAdapter(container);

// Decoraate ContainerAdapter instance
decorate(injectable(), Controller);

function setupIoC() {
    try {

        const logger = new CustomLogger({
            logLevel: 'debug'
        });
        logger.debug('First, bind the logger itself')
        if (container.isBound(SYMBOLS.CUSTOM_LOGGER)) {
            container.unbind(SYMBOLS.CUSTOM_LOGGER)
        }
        container.bind(SYMBOLS.CUSTOM_LOGGER).toConstantValue(logger);

        logger.debug('Now bind CustomLogger class for future eventually instantiations')
        if(!container.isBound(CustomLogger)) {
            container.bind(CustomLogger).toSelf().inSingletonScope();
        }

        logger.debug('Starting IoC container setup', 'IoC-Setup');

        //Setup basic IoC first
        IoCSetup(container, {
            apiKeys: [],
            needAdminPrivileges: false
        }, logger);

        const bindings = [
            { symbol: SYMBOLS.SERVER_INITIALIZER, constructor: ServerInitializer},
            { symbol: SYMBOLS.SERVER, constructor: Server},
            { symbol: SYMBOLS.API_APP, constructor: ApiApp},
            { symbol: SYMBOLS.APP, constructor: App}
        ];

        for (const binding of bindings) {
            if (container.isBound(binding.symbol)) {
                container.unbind(binding.symbol);
            }
            logger.debug(`Binding ${binding.symbol.toString()}`, 'IoC-Setup');
                container.bind(binding.symbol).to(binding.constructor).inSingletonScope();
        }

        
        // 7. Load any additional providers
        logger.debug('Loading provider module', 'IoC-Setup');
        container.load(buildProviderModule());

        logger.info('IoC container setup completed successfully', 'IoC-Setup');
        
        return container;

    } catch (error) {
        const logger = container.isBound(SYMBOLS.CUSTOM_LOGGER)
            ? container.get<CustomLogger>(SYMBOLS.CUSTOM_LOGGER)
            : new CustomLogger({ logLevel: 'debug' });

        logger.error(
            'Failed to setup IoC container',
            'IoC-Setup-Error',
            {
                errorDetails: error instanceof Error
                ? {
                    name: error.name,
                    message: error.message, 
                }: 'Unknown error'
            }
        );

        throw CustomError.create(
            'Failed to setup IoC container',
            500,
            { error }
        );
    }
}

export function initializeContainer() {
    //In order to unsure an only logger instance
    if(!container.isBound(SYMBOLS.CUSTOM_LOGGER)) {
        return setupIoC();
    }

    return container;
}



