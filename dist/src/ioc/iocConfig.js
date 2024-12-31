"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerAdapter = void 0;
exports.IoCSetup = IoCSetup;
const setAuth_1 = require("../auth/setAuth");
const strategyAuth_1 = require("../auth/strategyAuth");
const firebaseType_1 = require("../utility/firebaseType");
const apiKeyManager_1 = require("../services/apiKeyManager");
const errorType_1 = require("../utility/errorType");
const validationModel_1 = require("../validation/validationModel");
const server_1 = require("../server/server");
const routes_1 = require("../routes");
const app_1 = require("../app");
class ContainerAdapter {
    constructor(container) {
        this.container = container;
    }
    get(controller) {
        try {
            if (typeof controller === 'symbol' || typeof controller === 'function') {
                return this.container.get(controller);
            }
            return this.container.get(controller.constructor);
        }
        catch (error) {
            throw errorType_1.CustomError.create('Dependency not found', 500, {
                controller: controller.toString(),
                originalError: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.ContainerAdapter = ContainerAdapter;
function IoCSetup(iocContainer, options = {
    apiKeys: [],
    needAdminPrivileges: false
}, logger) {
    const { apiKeys = [], needAdminPrivileges = false } = options;
    logger.debug('Starting IoCSetup', 'IoC-Config');
    logger.debug('Binding Firebase Admin', 'IoC-Config', {
        needAdminPrivileges
    });
    iocContainer
        .bind(firebaseType_1.registry.FirebaseAdmin)
        .toDynamicValue(() => (0, setAuth_1.initializeFirebaseAdmin)(needAdminPrivileges))
        .inSingletonScope();
    logger.debug('Binding ApiKeyManager', 'IoC-Config');
    iocContainer
        .bind(apiKeyManager_1.ApiKeyManager)
        .toSelf()
        .inSingletonScope();
    const apiKeyManager = iocContainer.get(apiKeyManager_1.ApiKeyManager);
    logger.debug('Binding Auth Strategies', 'IoC-Config');
    try {
        iocContainer
            .bind(firebaseType_1.registry.FirebaseJwtAuthStrategy)
            .toDynamicValue(() => {
            const firebaseAdmin = iocContainer.get(firebaseType_1.registry.FirebaseAdmin);
            return new strategyAuth_1.FirebaseJwtAuthStrategy(firebaseAdmin, logger);
        })
            .inSingletonScope();
        iocContainer
            .bind(firebaseType_1.registry.ApiKeyAuthStrategy)
            .toDynamicValue(() => new strategyAuth_1.ApiKeyAuthstrategy(apiKeyManager, logger))
            .inSingletonScope();
    }
    catch (error) {
        logger.error('Failed to bind Auth Strategies', 'IoC-Config', {
            error: error instanceof Error
                ? error.message
                : 'Unknown error',
        });
        throw error;
    }
    logger.debug('Binding core services', 'IoC-Config');
    iocContainer.bind(validationModel_1.ModelManager).toSelf().inSingletonScope();
    iocContainer.bind(server_1.Server).toSelf().inSingletonScope();
    iocContainer.bind(routes_1.ApiApp).toSelf().inSingletonScope();
    iocContainer.bind(app_1.App).toSelf().inSingletonScope();
    logger.info('IoCSetup completed successfully', 'IoC-Config');
    return { apiKeyManager };
}
//# sourceMappingURL=iocConfig.js.map