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
        exports.container.bind(loggerType_1.CustomLogger).toSelf().inSingletonScope();
        (0, iocConfig_1.IoCSetup)(exports.container, {
            apiKeys: [],
            needAdminPrivileges: false
        });
        exports.container.bind(strategyAuth_1.AuthStrategyFactory).toSelf().inSingletonScope();
        ;
        exports.container.bind(validationModel_1.ModelManager).toSelf();
        exports.container.bind(apiKeyManager_1.ApiKeyManager).toSelf();
        exports.container.bind(server_1.Server).toSelf();
        exports.container.bind(routes_1.ApiApp).toSelf();
        exports.container.bind(app_1.App).toSelf();
        exports.container.load((0, inversify_binding_decorators_1.buildProviderModule)());
    }
    catch (error) {
        console.error('Ioc setup error:', error);
        throw errorType_1.CustomError.create('Failed to setup IoC container', 500, { error });
    }
}
setupIoC();
function loadProviderModule() {
}
//# sourceMappingURL=index.js.map