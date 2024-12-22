"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iocContainer = void 0;
exports.loadProviderModule = loadProviderModule;
const inversify_1 = require("inversify");
const tsoa_1 = require("tsoa");
const iocConfig_1 = require("./iocConfig");
const routes_1 = require("../routes");
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
const validationModel_1 = require("../validation/validationModel");
const container = new inversify_1.Container();
(0, inversify_1.decorate)((0, inversify_1.injectable)(), tsoa_1.Controller);
function setupIoC() {
    try {
        (0, iocConfig_1.IoCSetup)(container);
        container.bind(routes_1.ApiApp).toSelf();
        container.bind(validationModel_1.ModelManager).toSelf();
    }
    catch (error) {
        console.error("Error setting up IoC container:", error);
    }
}
function loadProviderModule() {
    setupIoC();
    container.load((0, inversify_binding_decorators_1.buildProviderModule)());
}
exports.iocContainer = new iocConfig_1.ContainerAdapter(container);
//# sourceMappingURL=index.js.map