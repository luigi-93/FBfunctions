"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = exports.ContainerAdapter = void 0;
exports.IoCSetup = IoCSetup;
const setAuth_1 = require("../auth/setAuth");
const loggerType_1 = require("../utility/loggerType");
const strategyAuth_1 = require("../auth/strategyAuth");
const firebaseType_1 = require("../utility/firebaseType");
const apiKeyManager_1 = require("../services/apiKeyManager");
class ContainerAdapter {
    constructor(container) {
        this.container = container;
    }
    get(controller) {
        return this.container.get(controller.constructor);
    }
}
exports.ContainerAdapter = ContainerAdapter;
exports.registry = {
    FirebaseAdmin: Symbol.for('FirebaseAdmin'),
    FirebaseJwtAuthStrategy: Symbol.for('FirebaseJwtAuthStrategy'),
    ApiKeyAuthStrategy: Symbol.for('ApiKeyAuthStrategy'),
};
function IoCSetup(iocContainer, options = {
    apiKeys: [],
    needAdminPrivileges: false
}) {
    const logger = new loggerType_1.CustomLogger();
    const { apiKeys = [], needAdminPrivileges = false } = options;
    iocContainer
        .bind(exports.registry.FirebaseAdmin)
        .toDynamicValue(() => (0, setAuth_1.initializeFirebaseAdmin)(needAdminPrivileges))
        .inSingletonScope();
    iocContainer
        .bind(exports.registry.FirebaseJwtAuthStrategy).
        toDynamicValue(() => {
        const firebaseAdmin = iocContainer.get(exports.registry.FirebaseAdmin);
        return new strategyAuth_1.FirebaseJwtAuthStrategy(firebaseAdmin, logger);
    });
    const apiKeyManager = new apiKeyManager_1.ApikeyManager();
    const registeredApikey = options.apiKeys?.map(keyConfig => {
        apiKeyManager.create(keyConfig.name, {
            scopes: keyConfig.scopes || [firebaseType_1.SecurityScopes.User],
            expiresAt: keyConfig.expiresAt
        });
    });
    iocContainer
        .bind(exports.registry.ApiKeyAuthStrategy)
        .toDynamicValue(() => new strategyAuth_1.ApiKeyAuthstrategy(apiKeyManager, logger));
    return {
        apiKeyManager,
        registeredApikey
    };
}
//# sourceMappingURL=iocConfig.js.map