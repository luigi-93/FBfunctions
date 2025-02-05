"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
exports.initializeContainer = initializeContainer;
const inversify_1 = require("inversify");
const tsoa_1 = require("tsoa");
const bindAuth_1 = require("./bindAuth");
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
const customError_1 = require("../errors/customError");
const customLogger_1 = require("../logging/customLogger");
const iocConfig_1 = require("../config/iocConfig");
exports.container = new inversify_1.Container({ defaultScope: 'Singleton' });
(0, inversify_1.decorate)((0, inversify_1.injectable)(), tsoa_1.Controller);
async function initializeContainer() {
    const logger = new customLogger_1.CustomLogger({ logLevel: 'debug' });
    logger.debug('Starting container setup with container instance', 'IoC-Init');
    try {
        (0, iocConfig_1.configBindings)(exports.container);
        logger.debug('Starting IoC container setup', 'IoC-Setup');
        const result = await (0, bindAuth_1.ioCSetup)(exports.container, {
            apiKeys: [],
            needAdminPrivileges: false
        }, logger);
        logger.debug('Loading provider module', 'IoC-Setup');
        exports.container.load((0, inversify_binding_decorators_1.buildProviderModule)());
        logger.info('IoC container setup completed successfully', 'IoC-Init', { result });
        return exports.container;
    }
    catch (error) {
        logger.error('Failed to setup IoC container', 'IoC-Setup-Error', {
            errorDetails: error instanceof Error
                ? {
                    name: error.name,
                    message: error.message,
                } : 'Unknown error'
        });
        throw customError_1.CustomError.create('Failed to setup IoC container', 500, { error });
    }
}
//# sourceMappingURL=index.js.map