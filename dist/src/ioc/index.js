"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iocContainer = exports.container = void 0;
exports.initializeContainer = initializeContainer;
const inversify_1 = require("inversify");
const customLogger_1 = require("../logging/customLogger");
const customError_1 = require("../errors/customError");
const tsoa_1 = require("tsoa");
const iocConfig_1 = require("../config/iocConfig");
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
const bindAuth_1 = require("./bindAuth");
const iocHelpers_1 = require("./iocHelpers");
exports.container = new inversify_1.Container({ defaultScope: 'Singleton' });
exports.iocContainer = new iocHelpers_1.ContainerAdapter(exports.container);
(0, inversify_1.decorate)((0, inversify_1.injectable)(), tsoa_1.Controller);
async function initializeContainer() {
    const logger = new customLogger_1.CustomLogger({ logLevel: 'debug' });
    logger.debug('Starting container setup with container instance', 'IoC-Init');
    try {
        (0, iocConfig_1.configBinding)(exports.container);
        logger.debug('Starting IoC container setup', 'IoC-Setup');
        const result = await (0, bindAuth_1.IoCSetup)(exports.container, {
            apiKeys: [],
            needAdminPrivileges: false
        }, logger);
        logger.debug('Loading provider module', 'IoC-Setup');
        exports.container.load((0, inversify_binding_decorators_1.buildProviderModule)());
        logger.info('IoC container setup completed successfully', 'IoC-Setup', { result });
        return exports.container;
    }
    catch (setupError) {
        logger.error('Container initialization failed', 'IoC-Init', {
            error: setupError instanceof Error
                ? {
                    name: setupError.name,
                    message: setupError.message,
                    stack: setupError.stack
                }
                : 'Uknown error'
        });
        throw customError_1.CustomError.create('InintilizeContainer does not return', 401, {
            error: setupError,
            phase: 'Container initilization'
        });
    }
}
//# sourceMappingURL=index.js.map