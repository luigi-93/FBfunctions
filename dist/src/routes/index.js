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
exports.ApiApp = void 0;
const inversify_1 = require("inversify");
const servConfig_1 = require("../config/servConfig");
const apiHandlerError_1 = require("../errors/apiHandlerError");
const customLogger_1 = require("../logging/customLogger");
const firebaseType_1 = require("../utility/firebaseType");
const strategyHelpers_1 = require("../strategies/strategyHelpers");
const regitster_routes_1 = require("./regitster-routes");
let ApiApp = class ApiApp extends servConfig_1.ServerConfig {
    constructor(logger, strategyFactory) {
        super(logger);
        this.strategyFactory = strategyFactory;
    }
    setRoutes() {
        (0, regitster_routes_1.resisterRoutesWithAuth)(this.app, this.strategyFactory);
    }
    setErrorHandler() {
        this.app.use((err, req, res, _next) => {
            (0, apiHandlerError_1.setErrorHandler)(err, res, this.setGeneralErrorHandler.bind(this));
        });
    }
};
exports.ApiApp = ApiApp;
exports.ApiApp = ApiApp = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)),
    __param(1, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.AUTH_STRATEGY_FACTORY)),
    __metadata("design:paramtypes", [customLogger_1.CustomLogger,
        strategyHelpers_1.AuthStrategyFactory])
], ApiApp);
//# sourceMappingURL=index.js.map