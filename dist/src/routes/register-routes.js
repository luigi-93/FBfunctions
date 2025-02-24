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
exports.RouteRegistrar = void 0;
const tsoaAuth_1 = require("../api/tsoaAuth");
const utilityKeys_1 = require("../utility/utilityKeys");
const routes_1 = require("../../build/api/routes");
const inversify_1 = require("inversify");
const customLogger_1 = require("../logging/customLogger");
const customError_1 = require("../errors/customError");
let RouteRegistrar = class RouteRegistrar {
    constructor(logger) {
        this.logger = logger;
    }
    register(app, strategyFactory) {
        this.logger.debug('RouteReigstrar.register() called', 'RouteRegistrar');
        this.logger.debug(`App instance received: ${app !== undefined}`, 'RouteRegistrar');
        this.logger.debug(`StrategyFactory instance received: ${strategyFactory !== undefined}`, 'RouteRegistrar');
        app.locals.strategyFactory = strategyFactory;
        const originalAuth = global.expressAuthentication;
        global.expressAuthentication = (request, securityName, scopes) => {
            const factory = app.locals.strategyFactory = strategyFactory;
            return (0, tsoaAuth_1.expressAuthentication)(request, securityName, scopes, factory);
        };
        try {
            this.logger.debug('Calling Register Route', 'RouteRegistrar');
            (0, routes_1.RegisterRoutes)(app);
            this.logger.debug('Register Route executed successfully', 'RouteRegistrar');
        }
        catch (error) {
            this.logger.error('Error in calling Register Route', 'RouteRegistrar', {
                errorDetaile: error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message
                    }
                    : 'Unknow erro'
            });
            throw customError_1.CustomError.create('Feiled to call Register Route', 500, {
                error
            });
        }
        finally {
            global.expressAuthentication = originalAuth;
        }
    }
};
exports.RouteRegistrar = RouteRegistrar;
exports.RouteRegistrar = RouteRegistrar = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.CUSTOM_LOGGER)),
    __metadata("design:paramtypes", [customLogger_1.CustomLogger])
], RouteRegistrar);
//# sourceMappingURL=register-routes.js.map