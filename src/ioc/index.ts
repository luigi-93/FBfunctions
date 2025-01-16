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
import { error } from "console";

export const container = new Container({ defaultScope: 'Singleton' });
export const iocContainer = new ContainerAdapter(container);
decorate(injectable(), Controller);

async function setupIoC(existingContainer: Container) {
    try {

        if(!existingContainer) {
            throw new Error('Container instance is undefined')
        }

        const logger = new CustomLogger({
            logLevel: 'debug'
        });

        logger.debug('Container state before setup:', 'IoC-Setup',
            {
                bindings: Object.keys(SYMBOLS).filter(key =>
                    existingContainer.isBound(SYMBOLS[key as keyof typeof SYMBOLS])
                ) 
            });

        logger.debug('First, bind the logger itself')
        if (existingContainer.isBound(SYMBOLS.CUSTOM_LOGGER)) {
            existingContainer.unbind(SYMBOLS.CUSTOM_LOGGER)
        }
        existingContainer.bind(SYMBOLS.CUSTOM_LOGGER).toConstantValue(logger);

        logger.debug('Now bind CustomLogger class for future eventually instantiations')
        if(!existingContainer.isBound(CustomLogger)) {
            existingContainer.bind(CustomLogger).toSelf().inSingletonScope();
        }

        logger.debug('Starting IoC container setup', 'IoC-Setup');

        //Setup basic IoC first
        await IoCSetup(existingContainer, {
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
            if (existingContainer.isBound(binding.symbol)) {
                existingContainer.unbind(binding.symbol);
            }
            logger.debug(`Binding ${binding.symbol.toString()}`, 'IoC-Setup');
            existingContainer.bind(binding.symbol).to(binding.constructor).inSingletonScope();
        }

        
        // 7. Load any additional providers
        logger.debug('Loading provider module', 'IoC-Setup');
        existingContainer.load(buildProviderModule());

        const requiredBindings = [
            SYMBOLS.CUSTOM_LOGGER,
            SYMBOLS.SERVER_INITIALIZER,
            SYMBOLS.SERVER,
            SYMBOLS.API_APP,
            SYMBOLS.APP
        ];
        const missingBindings = requiredBindings.filter(
            symbol => !existingContainer.isBound(symbol)
        );

        if (missingBindings.length > 0) {
            logger.error(
                'Missing required bindings',
                'IoC-Setup',
                {
                    missingBindings: missingBindings.map(symbol =>
                        Object.entries(SYMBOLS)
                        .find(([key, value]) => value === symbol)?.[0] || 'Unknow'
                    )
            });
            
            throw new Error(
                `Missing required binding: ${
                    missingBindings.map(symbol =>
                        Object.entries(SYMBOLS)
                            .find(([key, value]) => value === symbol)?.[0] || 'Unknow'
                    ).join(', ')
                }`
            )
        }

        logger.info('IoC container setup completed successfully', 'IoC-Setup');
        return existingContainer;

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

export async function initializeContainer(): Promise<Container> {
    try {
        const initializedContainer  = await setupIoC(container);
        if (!initializedContainer) {
            throw CustomError.create(
                'setupIoc returned undefined or null container',
                500,
                {
                    error
                });
        }
        return initializedContainer;
    } catch (error) {
        const tempLogger = new CustomLogger({ logLevel:'debug'});

        tempLogger.error(
            'Container initialization failed',
            'IoC-Init',
            {
                error: error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }
                : 'Uknown error'
            }
        )
        throw CustomError.create(
            'InintilizeContainer does not return',
            401,
            {
                error: error instanceof Error 
                ? error
                : 'Unknow error',
                phase: 'contaner initialization'
            });
    }
}



