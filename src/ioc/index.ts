import { 
    Container, 
    decorate, 
    injectable, 
    named} from "inversify";
import { Controller } from "tsoa";
import { ContainerAdapter, IoCSetup } from "./iocConfig";
import { buildProviderModule } from "inversify-binding-decorators";
import { CustomError } from "../utility/errorType";
import { CustomLogger } from '../utility/loggerType';
import { AuthStrategyFactory } from "../auth/strategyAuth";
import { Server } from "../server/server";
import { ApiApp } from "../routes";
import { App } from "../app";
import { SYMBOLS } from "../utility/firebaseType";


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
        if (!container.isBound(SYMBOLS.CUSTOM_LOGGER)) {
            container.bind(SYMBOLS.CUSTOM_LOGGER).toConstantValue(logger);
        }

        logger.debug('Starting IoC container setup', 'IoC-Setup');

        //bing dependencies with logging
        logger.debug('Setting dependencies', 'IoC-Setup');
        IoCSetup(container, {
            apiKeys: [],
            needAdminPrivileges: false
        }, logger);

        const bindings = [
            //una volta risolto il bug provare a riaggiungere AuthStrategyFactory
            //{ symbol: SYMBOLS.AUTH_STRATEGY_FACTORY, constructor: AuthStrategyFactory},
            { symbol: SYMBOLS.SERVER, constructor: Server},
            { symbol: SYMBOLS.API_APP, constructor: ApiApp},
            { symbol: SYMBOLS.APP, constructor: App}
        ];
        for (const binding of bindings) {
            if (!container.isBound(binding.symbol)) {
                logger.debug(`Binding ${binding.symbol.toString()}`, 'IoC-Setup');
                container.bind(binding.symbol).to(binding.constructor).inSingletonScope();
            }
        }

        
        // 7. Load any additional providers
        logger.debug('Loading provider module', 'IoC-Setup');
        container.load(buildProviderModule());

        logger.info('IoC container setup completed successfully', 'IoC-Setup');
        

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


setupIoC();

export function loadProviderModule() {
        // Maybe do additional setup here if needed

    }



