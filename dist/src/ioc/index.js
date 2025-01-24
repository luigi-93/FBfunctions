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
const console_1 = require("console");
exports.container = new inversify_1.Container({ defaultScope: 'Singleton' });
exports.iocContainer = new iocConfig_1.ContainerAdapter(exports.container);
(0, inversify_1.decorate)((0, inversify_1.injectable)(), tsoa_1.Controller);
async function setupIoC(existingContainer) {
    if (!existingContainer || !(existingContainer instanceof inversify_1.Container)) {
        throw errorType_1.CustomError.create(`Invalid container instance. Got: ${typeof existingContainer}`, 400, {
            container: exports.container
        });
    }
    const logger = new loggerType_1.CustomLogger({
        logLevel: 'debug'
    });
    logger.debug('Starting container setup with container instance', 'IoC-Setup', {
        containerExists: !!existingContainer,
        containerType: typeof existingContainer
    });
    try {
        logger.debug('Container state before setup:', 'IoC-Setup', {
            bindings: Object.keys(firebaseType_1.SYMBOLS).filter(key => existingContainer.isBound(firebaseType_1.SYMBOLS[key]))
        });
        logger.debug('First, bind the logger itself');
        if (existingContainer.isBound(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)) {
            existingContainer.unbind(firebaseType_1.SYMBOLS.CUSTOM_LOGGER);
        }
        existingContainer.bind(firebaseType_1.SYMBOLS.CUSTOM_LOGGER).toConstantValue(logger);
        logger.debug('Now bind CustomLogger class for future eventually instantiations');
        if (!existingContainer.isBound(loggerType_1.CustomLogger)) {
            existingContainer.bind(loggerType_1.CustomLogger).toSelf().inSingletonScope();
        }
        logger.debug('Starting IoC container setup', 'IoC-Setup');
        const result = await (0, iocConfig_1.IoCSetup)(existingContainer, {
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
            if (existingContainer.isBound(binding.symbol)) {
                existingContainer.unbind(binding.symbol);
            }
            logger.debug(`Binding ${binding.symbol.toString()}`, 'IoC-Setup');
            existingContainer.bind(binding.symbol).to(binding.constructor).inSingletonScope();
        }
        logger.debug('Loading provider module', 'IoC-Setup');
        existingContainer.load((0, inversify_binding_decorators_1.buildProviderModule)());
        logger.info('IoC container setup completed successfully', 'IoC-Setup', { result });
        return existingContainer;
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
async function initializeContainer() {
    const tempLogger = new loggerType_1.CustomLogger({ logLevel: 'debug' });
    try {
        tempLogger.debug('Initializing container', 'IoC-Init', {
            containerExists: !!exports.container,
            containerType: typeof exports.container
        });
        const initializedContainer = await setupIoC(exports.container);
        if (!initializedContainer) {
            throw errorType_1.CustomError.create('setupIoc returned undefined or null container', 500, {
                error: console_1.error
            });
        }
        return initializedContainer;
    }
    catch (setupError) {
        tempLogger.error('Container initialization failed', 'IoC-Init', {
            error: setupError instanceof Error
                ? {
                    name: setupError.name,
                    message: setupError.message,
                    stack: setupError.stack
                }
                : 'Uknown error'
        });
        throw errorType_1.CustomError.create('InintilizeContainer does not return', 401, {
            error: setupError,
            phase: 'Container initilization'
        });
    }
}
//# sourceMappingURL=index.js.map