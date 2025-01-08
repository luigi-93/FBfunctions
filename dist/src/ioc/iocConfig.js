"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerAdapter = void 0;
exports.IoCSetup = IoCSetup;
const firebaseType_1 = require("../utility/firebaseType");
const apiKeyManager_1 = require("../services/apiKeyManager");
const errorType_1 = require("../utility/errorType");
const validationApiKey_1 = require("../validation/validationApiKey");
const apiKeyStorage_1 = require("../services/apiKeyStorage");
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
    logger.debug('Binding ApiKeyManager dependencies', 'IoC-Config');
    if (!iocContainer.isBound(firebaseType_1.SYMBOLS.API_KEY_VALIDATOR)) {
        iocContainer.bind(firebaseType_1.SYMBOLS.API_KEY_VALIDATOR).to(validationApiKey_1.ApiKeyValidator).inSingletonScope();
    }
    if (!iocContainer.isBound(firebaseType_1.SYMBOLS.STORAGE_ADAPTER)) {
        iocContainer.bind(firebaseType_1.SYMBOLS.STORAGE_ADAPTER).to(apiKeyStorage_1.InMemoryStorageAdapter).inSingletonScope();
    }
    try {
        logger.debug('Binding ApiKeyManager', 'IoC-Config');
        if (!iocContainer.isBound(firebaseType_1.SYMBOLS.API_KEY_MANAGER)) {
            iocContainer
                .bind(firebaseType_1.SYMBOLS.API_KEY_MANAGER)
                .to(apiKeyManager_1.ApiKeyManager)
                .inSingletonScope();
        }
        const manager = iocContainer.get(firebaseType_1.SYMBOLS.API_KEY_MANAGER);
        logger.debug('Successfully created ApiKeyManager instance', 'IoC-Config', {
            apiKeyManager: manager
        });
        return { apiKeyManager: manager };
    }
    catch (error) {
        logger.error('Failed to create ApiKeyManager', 'IoC-Config', { errorDetails: error instanceof Error
                ? {
                    errorMessage: error.message,
                    errorName: error.name
                }
                : 'Unknown error',
        });
        throw errorType_1.CustomError.create('Failed to create ApiKeyManager', 500, { error });
    }
}
//# sourceMappingURL=iocConfig.js.map