import { ContainerAdapter } from "../ioc/iocHelpers";
import { ApiApp } from "../routes/index";
import { RouteRegistrar } from "../routes/register-routes";
import { App } from "../app";
import { Container } from "inversify";
import { CustomLogger } from "../logging/customLogger";
import { Server } from "../server/server";
import { ServerInitializer } from "../server/serverInitializer";
import { SYMBOLS } from "../utility/utilityKeys";

export function configBinding(container: Container): void {
    const logger = new CustomLogger({ logLevel: 'debug'});

    // First bind the container itself
    logger.debug('Binding container instance')
    container.bind<Container>(SYMBOLS.CONTAINER).toConstantValue(container);

    logger.debug('Binding ContainerAdapter');
    if (!container.isBound(SYMBOLS.CONTAINER_ADAPTER)) {
        container
            .bind<ContainerAdapter>(SYMBOLS.CONTAINER_ADAPTER)
            .toDynamicValue((context) => {
                const container = context.container.get<Container>(SYMBOLS.CONTAINER);
                return new ContainerAdapter(container)
            })
            .inSingletonScope();
    }

    logger.debug('Binding the logger itself');
    if (container.isBound(SYMBOLS.CUSTOM_LOGGER)) {
        container.unbind(SYMBOLS.CUSTOM_LOGGER)
    }
    container.bind(SYMBOLS.CUSTOM_LOGGER).toConstantValue(logger);

    logger.debug('Now binding Custom class for future eventually instantiations');
    if (!container.isBound(CustomLogger)) {
        container.bind(CustomLogger).toSelf().inSingletonScope();
    }

    const bindings = [
        { symbol: SYMBOLS.SERVER_INITIALIZER, constructor: ServerInitializer},
        { symbol: SYMBOLS.SERVER, constructor: Server},
        { symbol: SYMBOLS.API_APP, constructor: ApiApp},
        { symbol: SYMBOLS.APP, constructor: App},
        { symbol: SYMBOLS.ROUTE_REGISTRAR, constructor: RouteRegistrar}
    ];
    
    for (const binding of bindings) {
        if (container.isBound(binding.symbol)) {
            container.unbind(binding.symbol);
        }
        logger.debug(`Binding ${binding.symbol.toString()}`, 'IoC-Setup');
        container.bind(binding.symbol).to(binding.constructor).inSingletonScope();
    }

}




