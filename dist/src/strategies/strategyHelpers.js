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
exports.BaseAuthStrategy = exports.AuthStrategyFactory = void 0;
const inversify_1 = require("inversify");
const firebaseType_1 = require("../utility/firebaseType");
const customError_1 = require("../errors/customError");
const customLogger_1 = require("../logging/customLogger");
const iocHelpers_1 = require("../ioc/iocHelpers");
let AuthStrategyFactory = class AuthStrategyFactory {
    constructor(logger, ioc) {
        this.logger = logger;
        this.ioc = ioc;
    }
    getStrategy(name) {
        if (!name) {
            this.logger.warn('Strategy name not provided', 'AuthStrategyFactory');
            throw customError_1.CustomError.create('strategy name is reuired', 400, { details: 'The strategy name parameter was not provided.' });
        }
        const strategySymbol = firebaseType_1.StrategyRegistry[name];
        if (!strategySymbol) {
            this.logger.warn(`Strategy ${name} not found in registry`, 'AuthStrategyFactory');
            throw customError_1.CustomError.create(`Authentication strategy ${name} not found`, 403, {
                name,
                availableStrategies: Object.keys(firebaseType_1.StrategyRegistry),
            });
        }
        try {
            const strategy = this.ioc.get(strategySymbol);
            this.logger.info(`Successfully resolved strategy: ${name}`, 'AuthStrategyFactory', { strategyName: name });
            return strategy;
        }
        catch (error) {
            this.logger.error(`Failed to resolve strategy: ${name}`, 'AuthStrategyFactory', {
                errorDetails: error instanceof Error
                    ? error.message
                    : 'Unknown error',
            });
            throw customError_1.CustomError.create('Failed to initialize authentication strategy', 500, {
                strategy: name,
                error: error instanceof Error
                    ? error.message
                    : 'Unknown error'
            });
        }
    }
};
exports.AuthStrategyFactory = AuthStrategyFactory;
exports.AuthStrategyFactory = AuthStrategyFactory = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)),
    __param(1, (0, inversify_1.inject)(new inversify_1.LazyServiceIdentifier(() => firebaseType_1.SYMBOLS.CONTAINER_ADAPTER))),
    __metadata("design:paramtypes", [customLogger_1.CustomLogger,
        iocHelpers_1.ContainerAdapter])
], AuthStrategyFactory);
class BaseAuthStrategy {
    constructor(logger) {
        this.logger = logger || new customLogger_1.CustomLogger();
    }
    validateScopes(user, request, requiredScopes) {
        if (requiredScopes.length === 0) {
            this.logger.debug('No scope validation required', 'BaseAuthStrategy.validateScopes', {
                userId: user.getCustomClaim('uid')
            });
            return;
        }
        this.logger.debug('Starting scope validation', 'BaseAuthStrategy.validateScoopes', {
            requiredScopes,
            userId: user.getCustomClaim('uid')
        });
        user.isAllowedTo(request, {
            requiredScopes: requiredScopes
        });
        this.logger.debug('Scope validation successful', 'BaseAuthStrategy.validateScopes', {
            requiredScopes,
            userId: user.getCustomClaim('uid')
        });
    }
}
exports.BaseAuthStrategy = BaseAuthStrategy;
//# sourceMappingURL=strategyHelpers.js.map