"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const ioc_1 = require("./ioc");
const dotenv_1 = __importDefault(require("dotenv"));
const loggerType_1 = require("./utility/loggerType");
const server_1 = require("./server/server");
const routes_1 = require("./routes");
const apiKeyManager_1 = require("./services/apiKeyManager");
const firebaseConfig_1 = require("./config/firebaseConfig");
const serverInitializer_1 = require("./server/serverInitializer");
dotenv_1.default.config();
(0, ioc_1.loadProviderModule)();
async function main() {
    const app = (0, express_1.default)();
    const logger = ioc_1.iocContainer.get(loggerType_1.CustomLogger);
    logger.info('strarting app...');
    const firebaseConfig = (0, firebaseConfig_1.createFirebaseConfig)();
    if (!(0, firebaseConfig_1.configureFirebase)(firebaseConfig, process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        logger.error('Invalid Firebase configuration', 'App initilization');
        process.exit(1);
    }
    const serverInitializer = new serverInitializer_1.ServerInitializer(logger, ioc_1.iocContainer.get(server_1.Server), ioc_1.iocContainer.get(routes_1.ApiApp), ioc_1.iocContainer.get(apiKeyManager_1.ApikeyManager));
    const PORT = Number(process.env.PORT || 3000);
    const cleanup = () => {
        logger.info('Performing cleanup before server shutdown...');
    };
    await serverInitializer.initialize(app, PORT, cleanup);
    return app;
}
exports.app = main();
//# sourceMappingURL=app.js.map