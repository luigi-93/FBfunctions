"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
exports.app = createApp;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("./server/server");
const routes_1 = require("./routes");
const apiKeyManager_1 = require("./services/apiKeyManager");
const firebaseConfig_1 = require("./config/firebaseConfig");
const serverInitializer_1 = require("./server/serverInitializer");
const customLogger_1 = require("./logging/customLogger");
const inversify_1 = require("inversify");
const utilityKeys_1 = require("./utility/utilityKeys");
const customError_1 = require("./errors/customError");
const containerInit_1 = require("./ioc/containerInit");
dotenv_1.default.config();
let App = class App {
    constructor(logger, server, apiApp, apikeyManager, serverInitializer) {
        this.logger = logger;
        this.server = server;
        this.apiApp = apiApp;
        this.apikeyManager = apikeyManager;
        this.serverInitializer = serverInitializer;
    }
    async cleanup() {
        this.logger.info('Performing cleanup before server shutdown...');
    }
    ;
    async initialize() {
        const app = (0, express_1.default)();
        this.logger.info('strarting app...');
        const firebaseConfig = (0, firebaseConfig_1.createFirebaseConfig)();
        if (!(0, firebaseConfig_1.configureFirebase)(firebaseConfig, process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
            this.logger.error('Invalid Firebase configuration', 'App initilization');
            process.exit(1);
        }
        const PORT = Number(process.env.PORT || 3000);
        await this.serverInitializer.initialize(app, PORT, () => this.cleanup());
        return app;
    }
};
exports.App = App;
exports.App = App = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.CUSTOM_LOGGER)),
    __param(1, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.SERVER)),
    __param(2, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.API_APP)),
    __param(3, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.API_KEY_MANAGER)),
    __param(4, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.SERVER_INITIALIZER)),
    __metadata("design:paramtypes", [customLogger_1.CustomLogger,
        server_1.Server,
        routes_1.ApiApp,
        apiKeyManager_1.ApiKeyManager,
        serverInitializer_1.ServerInitializer])
], App);
async function createApp() {
    const logger = new customLogger_1.CustomLogger({ logLevel: 'debug' });
    try {
        logger.debug('Starting application creation', 'App-Init');
        const initializedContainer = await (0, containerInit_1.initializeContainer)();
        if (!initializedContainer) {
            throw customError_1.CustomError.create('Container inialization', 401, {});
        }
        for (const binding of utilityKeys_1.requiredBindngs) {
            if (!initializedContainer.isBound(binding.symbol)) {
                logger.error(`Missing required binding: ${binding.name}`, 'App-Init');
                throw customError_1.CustomError.create(`${binding.name} binding not found`, 500, {
                    error: `Required binding ${binding.name} is missing`,
                    symbol: binding.symbol.toString(),
                });
            }
        }
        const application = initializedContainer.get(utilityKeys_1.SYMBOLS.APP);
        const result = await application.initialize();
        logger.info('Application created successfully', 'App-Init');
        return result;
    }
    catch (error) {
        logger.error('Failed to create application', 'App-Init', {
            error: error instanceof Error
                ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                }
                : 'Unknow error'
        });
        throw customError_1.CustomError.create('Failed to create application', 500, { error });
    }
}
//# sourceMappingURL=app.js.map