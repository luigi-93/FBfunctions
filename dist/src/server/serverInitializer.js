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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerInitializer = void 0;
const routes_1 = require("../routes");
const loggerType_1 = require("../utility/loggerType");
const server_1 = require("./server");
const apiKeyManager_1 = require("../services/apiKeyManager");
const firebaseType_1 = require("../utility/firebaseType");
const inversify_1 = require("inversify");
let ServerInitializer = class ServerInitializer {
    constructor(logger, server, apiApp, apiKeyManager) {
        this.logger = logger;
        this.server = server;
        this.apiApp = apiApp;
        this.apiKeyManager = apiKeyManager;
    }
    async initialize(app, port, cleanup) {
        try {
            await this.server
                .build(app, '/api', this.apiApp)
                .setupProcessErrorHandler(cleanup)
                .start(app, port);
            this.logger.info(`Server started on port ${port}`);
            this.registerDefaultApiKey();
            return app;
        }
        catch (error) {
            this.logger.error('Failed to start server', 'App Initilization', { error });
            process.exit(1);
        }
    }
    registerDefaultApiKey() {
        this.apiKeyManager.create('default-service-key', {
            scopes: [firebaseType_1.SecurityScopes.User],
            expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        });
    }
};
exports.ServerInitializer = ServerInitializer;
exports.ServerInitializer = ServerInitializer = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)),
    __param(1, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.SERVER)),
    __param(2, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.API_APP)),
    __param(3, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.API_KEY_MANAGER)),
    __metadata("design:paramtypes", [loggerType_1.CustomLogger,
        server_1.Server,
        routes_1.ApiApp,
        apiKeyManager_1.ApiKeyManager])
], ServerInitializer);
//# sourceMappingURL=serverInitializer.js.map