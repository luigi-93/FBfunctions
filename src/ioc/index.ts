import { 
    Container, 
    decorate, 
    injectable
} from "inversify";
import { Controller } from "tsoa";
import { IoCSetup } from "./iocConfig";
import { buildProviderModule } from "inversify-binding-decorators";
import { CustomError } from "../errors/customError";
import { CustomLogger } from '../logging/customLogger';
import { Server } from "../server/server";
import { ApiApp } from "../routes";
import { App } from "../app";
import { SYMBOLS } from "../utility/firebaseType";
import { ServerInitializer } from "../server/serverInitializer";
import { ContainerAdapter } from "./iocHelpers";


export const container = new Container({ defaultScope: 'Singleton' });
export const iocContainer = new ContainerAdapter(container);
decorate(injectable(), Controller);

export async function setupIoC(existingContainer: Container) {

    if(!existingContainer || !(existingContainer instanceof Container)) {
        throw CustomError.create(
            `Invalid container instance. Got: ${typeof existingContainer}`,
            400,
            {
                container
            }
        )
    }

    const logger = new CustomLogger({
        logLevel: 'debug'
    });
    logger.debug(
        'Starting container setup with container instance',
        'IoC-Setup',
        {
            containerExists: !!existingContainer,
            containerType: typeof existingContainer 
        });

    try {
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
        const result = await IoCSetup(
            existingContainer, 
            {
                apiKeys: [],
                needAdminPrivileges: false
            }, 
            logger);

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
        logger.debug('Loading provider module', 'IoC-Setup');
        existingContainer.load(buildProviderModule());

        logger.info(
            'IoC container setup completed successfully', 
            'IoC-Setup', 
            { result });

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



