"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteRegistrar = void 0;
const tsoaAuth_1 = require("../api/tsoaAuth");
const routes_1 = require("../../build/api/routes");
const inversify_1 = require("inversify");
let RouteRegistrar = class RouteRegistrar {
    register(app, strategyFactory) {
        app.locals.strategyFactory = strategyFactory;
        const originalAuth = global.expressAuthentication;
        global.expressAuthentication = (request, securityName, scopes) => {
            const factory = app.locals.strategyFactory = strategyFactory;
            return (0, tsoaAuth_1.expressAuthentication)(request, securityName, scopes, factory);
        };
        try {
            (0, routes_1.RegisterRoutes)(app);
        }
        finally {
            global.expressAuthentication = originalAuth;
        }
    }
};
exports.RouteRegistrar = RouteRegistrar;
exports.RouteRegistrar = RouteRegistrar = __decorate([
    (0, inversify_1.injectable)()
], RouteRegistrar);
//# sourceMappingURL=register-routes.js.map