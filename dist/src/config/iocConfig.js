"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configBindings = configBindings;
const index_1 = require("../routes/index");
const app_1 = require("../app");
const customLogger_1 = require("../logging/customLogger");
const server_1 = require("../server/server");
const serverInitializer_1 = require("../server/serverInitializer");
const utilityKeys_1 = require("../utility/utilityKeys");
const iocHelpers_1 = require("../ioc/iocHelpers");
const register_routes_1 = require("../routes/register-routes");
function configBindings(container) {
    const logger = new customLogger_1.CustomLogger({ logLevel: 'debug' });
    logger.debug('Binding container instance');
    container.bind(utilityKeys_1.SYMBOLS.CONTAINER).toConstantValue(container);
    logger.debug('Bindind ContaierAdapter');
    if (!container.isBound(utilityKeys_1.SYMBOLS.CONTAINER_ADAPTER)) {
        container
            .bind(utilityKeys_1.SYMBOLS.CONTAINER_ADAPTER)
            .toDynamicValue((context) => {
            const container = context.container.get(utilityKeys_1.SYMBOLS.CONTAINER);
            return new iocHelpers_1.ContainerAdapter(container);
        })
            .inSingletonScope();
    }
    logger.debug('Binding the logger itself');
    if (container.isBound(utilityKeys_1.SYMBOLS.CUSTOM_LOGGER)) {
        container.unbind(utilityKeys_1.SYMBOLS.CUSTOM_LOGGER);
    }
    container.bind(utilityKeys_1.SYMBOLS.CUSTOM_LOGGER).toConstantValue(logger);
    logger.debug('Now binding CustomLogger class for future eventually instantiations');
    if (!container.isBound(customLogger_1.CustomLogger)) {
        container.bind(customLogger_1.CustomLogger).toSelf().inSingletonScope();
    }
    const bindings = [
        { symbol: utilityKeys_1.SYMBOLS.SERVER_INITIALIZER, constructor: serverInitializer_1.ServerInitializer },
        { symbol: utilityKeys_1.SYMBOLS.SERVER, constructor: server_1.Server },
        { symbol: utilityKeys_1.SYMBOLS.API_APP, constructor: index_1.ApiApp },
        { symbol: utilityKeys_1.SYMBOLS.APP, constructor: app_1.App },
        { symbol: utilityKeys_1.SYMBOLS.ROUTE_REGISTRAR, constructor: register_routes_1.RouteRegistrar }
    ];
    for (const binding of bindings) {
        if (container.isBound(binding.symbol)) {
            container.unbind(binding.symbol);
        }
        logger.debug(`Binding ${binding.symbol.toString()}`, 'IoC-Setup');
        container.bind(binding.symbol).to(binding.constructor).inSingletonScope();
    }
}
//# sourceMappingURL=iocConfig.js.map