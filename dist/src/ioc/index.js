"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iocContainer = exports.container = void 0;
exports.initializeContainer = initializeContainer;
const inversify_1 = require("inversify");
const tsoa_1 = require("tsoa");
const iocConfig_1 = require("./iocConfig");
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
const errorType_1 = require("../utility/errorType");
const loggerType_1 = require("../utility/loggerType");
const server_1 = require("../server/server");
const routes_1 = require("../routes");
const app_1 = require("../app");
const firebaseType_1 = require("../utility/firebaseType");
const serverInitializer_1 = require("../server/serverInitializer");
exports.container = new inversify_1.Container({ defaultScope: 'Singleton' });
exports.iocContainer = new iocConfig_1.ContainerAdapter(exports.container);
(0, inversify_1.decorate)((0, inversify_1.injectable)(), tsoa_1.Controller);
function setupIoC() {
    try {
        const logger = new loggerType_1.CustomLogger({
            logLevel: 'debug'
        });
        logger.debug('First, bind the logger itself');
        if (exports.container.isBound(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)) {
            exports.container.unbind(firebaseType_1.SYMBOLS.CUSTOM_LOGGER);
        }
        exports.container.bind(firebaseType_1.SYMBOLS.CUSTOM_LOGGER).toConstantValue(logger);
        logger.debug('Now bind CustomLogger class for future eventually instantiations');
        if (!exports.container.isBound(loggerType_1.CustomLogger)) {
            exports.container.bind(loggerType_1.CustomLogger).toSelf().inSingletonScope();
        }
        logger.debug('Starting IoC container setup', 'IoC-Setup');
        (0, iocConfig_1.IoCSetup)(exports.container, {
            apiKeys: [],
            needAdminPrivileges: false
        }, logger);
        const bindings = [
            { symbol: firebaseType_1.SYMBOLS.SERVER_INITIALIZER, constructor: serverInitializer_1.ServerInitializer },
            { symbol: firebaseType_1.SYMBOLS.SERVER, constructor: server_1.Server },
            { symbol: firebaseType_1.SYMBOLS.API_APP, constructor: routes_1.ApiApp },
            { symbol: firebaseType_1.SYMBOLS.APP, constructor: app_1.App }
        ];
        for (const binding of bindings) {
            if (exports.container.isBound(binding.symbol)) {
                exports.container.unbind(binding.symbol);
            }
            logger.debug(`Binding ${binding.symbol.toString()}`, 'IoC-Setup');
            exports.container.bind(binding.symbol).to(binding.constructor).inSingletonScope();
        }
        logger.debug('Loading provider module', 'IoC-Setup');
        exports.container.load((0, inversify_binding_decorators_1.buildProviderModule)());
        logger.info('IoC container setup completed successfully', 'IoC-Setup');
        return exports.container;
    }
    catch (error) {
        const logger = exports.container.isBound(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)
            ? exports.container.get(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)
            : new loggerType_1.CustomLogger({ logLevel: 'debug' });
        logger.error('Failed to setup IoC container', 'IoC-Setup-Error', {
            errorDetails: error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                } : 'Unknown error'
        });
        throw errorType_1.CustomError.create('Failed to setup IoC container', 500, { error });
    }
}
function initializeContainer() {
    if (!exports.container.isBound(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)) {
        return setupIoC();
    }
    return exports.container;
}
//# sourceMappingURL=index.js.map