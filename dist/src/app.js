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
exports.app = exports.App = void 0;
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const ioc_1 = require("./ioc");
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("./server/server");
const routes_1 = require("./routes");
const apiKeyManager_1 = require("./services/apiKeyManager");
const firebaseConfig_1 = require("./config/firebaseConfig");
const serverInitializer_1 = require("./server/serverInitializer");
const loggerType_1 = require("./utility/loggerType");
const inversify_1 = require("inversify");
const firebaseType_1 = require("./utility/firebaseType");
dotenv_1.default.config();
let App = class App {
    constructor(logger, server, apiApp, apikeyManager) {
        this.logger = logger;
        this.server = server;
        this.apiApp = apiApp;
        this.apikeyManager = apikeyManager;
    }
    async initialize() {
        const app = (0, express_1.default)();
        this.logger.info('strarting app...');
        const firebaseConfig = (0, firebaseConfig_1.createFirebaseConfig)();
        if (!(0, firebaseConfig_1.configureFirebase)(firebaseConfig, process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
            this.logger.error('Invalid Firebase configuration', 'App initilization');
            process.exit(1);
        }
        const serverInitializer = new serverInitializer_1.ServerInitializer(this.logger, this.server, this.apiApp, this.apikeyManager);
        const PORT = Number(process.env.PORT || 3000);
        const cleanup = () => {
            this.logger.info('Performing cleanup before server shutdown...');
        };
        await serverInitializer.initialize(app, PORT, cleanup);
        return app;
    }
};
exports.App = App;
exports.App = App = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)),
    __param(1, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.SERVER)),
    __param(2, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.API_APP)),
    __param(3, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.API_KEY_MANAGER)),
    __metadata("design:paramtypes", [loggerType_1.CustomLogger,
        server_1.Server,
        routes_1.ApiApp,
        apiKeyManager_1.ApiKeyManager])
], App);
(0, ioc_1.loadProviderModule)();
async function createApp() {
    const application = ioc_1.iocContainer.get(firebaseType_1.SYMBOLS.APP);
    return application.initialize();
}
exports.app = createApp();
//# sourceMappingURL=app.js.map