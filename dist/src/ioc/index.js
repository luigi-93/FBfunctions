"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iocContainer = exports.container = void 0;
exports.loadProviderModule = loadProviderModule;
const inversify_1 = require("inversify");
const tsoa_1 = require("tsoa");
const iocConfig_1 = require("./iocConfig");
const routes_1 = require("../routes");
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
const validationModel_1 = require("../validation/validationModel");
const server_1 = require("../server/server");
const apiKeyManager_1 = require("../services/apiKeyManager");
const errorType_1 = require("../utility/errorType");
const app_1 = require("../app");
const loggerType_1 = require("../utility/loggerType");
const strategyAuth_1 = require("../auth/strategyAuth");
exports.container = new inversify_1.Container();
exports.iocContainer = new iocConfig_1.ContainerAdapter(exports.container);
(0, inversify_1.decorate)((0, inversify_1.injectable)(), tsoa_1.Controller);
function setupIoC() {
    try {
        const logger = new loggerType_1.CustomLogger({
            logLevel: 'debug'
        });
        if (!exports.container.isBound(loggerType_1.CustomLogger)) {
            exports.container.bind(loggerType_1.CustomLogger).toConstantValue(logger);
        }
        logger.debug('Starting IoC container setup', 'IoC-Setup');
        logger.debug('Setting up Firebase dependencies', 'IoC-Setup');
        (0, iocConfig_1.IoCSetup)(exports.container, {
            apiKeys: [],
            needAdminPrivileges: false
        }, logger);
        logger.debug('Binding AuthStrategyFactory', 'IoC-Setup');
        if (!exports.container.isBound(strategyAuth_1.AuthStrategyFactory)) {
            exports.container.bind(strategyAuth_1.AuthStrategyFactory).toSelf().inSingletonScope();
            ;
        }
        logger.debug('Binding core services', 'IoC-Setup', {
            services: ['ModelManager', 'ApiKeyManager', 'Server']
        });
        if (!exports.container.isBound(validationModel_1.ModelManager)) {
            exports.container.bind(validationModel_1.ModelManager).toSelf();
        }
        if (!exports.container.isBound(apiKeyManager_1.ApiKeyManager)) {
            exports.container.bind(apiKeyManager_1.ApiKeyManager).toSelf();
        }
        if (!exports.container.isBound(server_1.Server)) {
            exports.container.bind(server_1.Server).toSelf();
        }
        logger.debug('Binding API and App components', 'IoC-Setup');
        logger.debug('Binding API and App components', 'IoC-Setup');
        if (!exports.container.isBound(routes_1.ApiApp)) {
            exports.container.bind(routes_1.ApiApp).toSelf();
        }
        if (!exports.container.isBound(app_1.App)) {
            exports.container.bind(app_1.App).toSelf();
        }
        logger.debug('Loading provider module', 'IoC-Setup');
        exports.container.load((0, inversify_binding_decorators_1.buildProviderModule)());
        logger.info('IoC container setup completed successfully', 'IoC-Setup');
    }
    catch (error) {
        const logger = exports.container.isBound(loggerType_1.CustomLogger)
            ? exports.container.get(loggerType_1.CustomLogger)
            : new loggerType_1.CustomLogger({ logLevel: 'error' });
        logger.error('Failed to setup IoC container', 'IoC-Setup-Error', {
            error: error instanceof Error
                ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                } : error
        });
        throw errorType_1.CustomError.create('Failed to setup IoC container', 500, { error });
    }
}
setupIoC();
function loadProviderModule() {
}
//# sourceMappingURL=index.js.map