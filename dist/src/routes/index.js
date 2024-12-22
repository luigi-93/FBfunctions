"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiApp = void 0;
const inversify_1 = require("inversify");
const servConfig_1 = require("../config/servConfig");
const routes_1 = require("../../build/api/routes");
const apiHandlerError_1 = require("../error/apiHandlerError");
let ApiApp = class ApiApp extends servConfig_1.ServerConfig {
    setRoutes() {
        (0, routes_1.RegisterRoutes)(this.app);
    }
    setErrorHandler() {
        this.app.use((err, req, res, _next) => {
            (0, apiHandlerError_1.setErrorHandler)(err, res, this.setGeneralErrorHandler.bind(this));
        });
    }
};
exports.ApiApp = ApiApp;
exports.ApiApp = ApiApp = __decorate([
    (0, inversify_1.injectable)()
], ApiApp);
//# sourceMappingURL=index.js.map