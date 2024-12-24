"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerAdapter = void 0;
exports.IoCSetup = IoCSetup;
const setAuth_1 = require("../auth/setAuth");
const loggerType_1 = require("../utility/loggerType");
const strategyAuth_1 = require("../auth/strategyAuth");
const firebaseType_1 = require("../utility/firebaseType");
const apiKeyManager_1 = require("../services/apiKeyManager");
const errorType_1 = require("../utility/errorType");
class ContainerAdapter {
    constructor(container) {
        this.container = container;
    }
    get(controller) {
        try {
            if (typeof controller === 'symbol') {
                const dummyController = {
                    prototype: {},
                    constructor: controller
                };
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
    getBySymbol(symbol) {
        return this.container.get(symbol);
    }
}
exports.ContainerAdapter = ContainerAdapter;
function IoCSetup(iocContainer, options = {
    apiKeys: [],
    needAdminPrivileges: false
}) {
    const { apiKeys = [], needAdminPrivileges = false } = options;
    iocContainer
        .bind(loggerType_1.CustomLogger)
        .toSelf()
        .inSingletonScope();
    const logger = iocContainer.get(loggerType_1.CustomLogger);
    iocContainer
        .bind(firebaseType_1.registry.FirebaseAdmin)
        .toDynamicValue(() => (0, setAuth_1.initializeFirebaseAdmin)(needAdminPrivileges))
        .inSingletonScope();
    iocContainer
        .bind(firebaseType_1.registry.FirebaseJwtAuthStrategy)
        .toDynamicValue(() => {
        const firebaseAdmin = iocContainer.get(firebaseType_1.registry.FirebaseAdmin);
        return new strategyAuth_1.FirebaseJwtAuthStrategy(firebaseAdmin, logger);
    })
        .inSingletonScope();
    const apiKeyManager = new apiKeyManager_1.ApikeyManager();
    iocContainer
        .bind(firebaseType_1.registry.ApiKeyAuthStrategy)
        .toDynamicValue(() => new strategyAuth_1.ApiKeyAuthstrategy(apiKeyManager, logger));
    return {
        apiKeyManager
    };
}
//# sourceMappingURL=iocConfig.js.map