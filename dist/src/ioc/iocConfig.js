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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerAdapter = void 0;
exports.IoCSetup = IoCSetup;
const inversify_1 = require("inversify");
const firebaseType_1 = require("../utility/firebaseType");
const apiKeyManager_1 = require("../services/apiKeyManager");
const errorType_1 = require("../utility/errorType");
const validationApiKey_1 = require("../validation/validationApiKey");
const apiKeyStorage_1 = require("../services/apiKeyStorage");
const setAuth_1 = require("../auth/setAuth");
const strategyAuth_1 = require("../auth/strategyAuth");
let ContainerAdapter = class ContainerAdapter {
    constructor(container) {
        this.container = container;
        if (!container) {
            throw errorType_1.CustomError.create('Container instance is required', 500, {
                details: 'Container was not provided to ContainerAdapter'
            });
        }
    }
    get(controller) {
        try {
            if (!controller) {
                throw errorType_1.CustomError.create('Controller parameter is requireds', 500, {
                    message: 'Constroller was not provided'
                });
            }
            if (typeof controller === 'symbol' || typeof controller === 'function') {
                return this.container.get(controller);
            }
            if (typeof controller === 'object' && 'prototype' in controller) {
                const serviceIdentifier = controller.constructor;
                if (!serviceIdentifier) {
                    throw errorType_1.CustomError.create('Invalid controller constructor', 500, {
                        message: 'Provide the right controller constructor'
                    });
                }
                return this.container.get(serviceIdentifier);
            }
            throw errorType_1.CustomError.create('Unsupported controller type', 500, {
                message: 'The type of controller is not supported'
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorDetails = {
                controller: this.getControllerIdentifier(controller),
                originalError: errorMessage
            };
            throw errorType_1.CustomError.create('Dependency resolution failed', 500, errorDetails);
        }
    }
    getControllerIdentifier(controller) {
        if (typeof controller === 'symbol') {
            return controller.toString();
        }
        if (typeof controller === 'function') {
            return controller.name || 'Anonymous Function';
        }
        if (controller?.constructor) {
            return controller.constructor.name || 'Unknown Class';
        }
        return 'Unknow Controller Type';
    }
};
exports.ContainerAdapter = ContainerAdapter;
exports.ContainerAdapter = ContainerAdapter = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [inversify_1.Container])
], ContainerAdapter);
async function IoCSetup(iocContainer, options = {
    apiKeys: [],
    needAdminPrivileges: false
}, logger) {
    const { apiKeys = [], needAdminPrivileges = false } = options;
    logger.debug('Setting up Firebase dependencies', 'IoC-Config');
    try {
        iocContainer
            .bind(firebaseType_1.registry.FirebaseAdmin)
            .toDynamicValue(() => (0, setAuth_1.initializeFirebaseAdmin)(needAdminPrivileges))
            .inSingletonScope();
        iocContainer
            .bind(firebaseType_1.registry.FirebaseJwtAuthStrategy)
            .toDynamicValue((context) => {
            try {
                const firebaseAdmin = context.container.get(firebaseType_1.registry.FirebaseAdmin);
                const strategyLogger = context.container.get(firebaseType_1.SYMBOLS.CUSTOM_LOGGER);
                return new strategyAuth_1.FirebaseJwtAuthStrategy(firebaseAdmin, strategyLogger);
            }
            catch (error) {
                logger.error('Failed to initialize Firebase Jwt Authentication Strategy', 'IoC-Config', { error });
                throw errorType_1.CustomError.create('Failed to initialize Firebase Jwt Authentication Strategy', 500, { error });
            }
        })
            .inSingletonScope();
        logger.debug('Successfully bind Firebase JWT Auth Strategy', 'IoC-Config');
    }
    catch (error) {
        logger.error('Failed to setup Firebase Authentication dependencies', 'IoC-Config', { errorDetails: error instanceof Error
                ? {
                    errorMessage: error.message,
                    errorName: error.name
                }
                : 'Unknown error',
        });
        throw errorType_1.CustomError.create('Failed to setup Firebase Authentication dependencies', 500, { error });
    }
    logger.debug('Binding ApiKeyManager dependencies', 'IoC-Config');
    if (!iocContainer.isBound(firebaseType_1.SYMBOLS.API_KEY_VALIDATOR)) {
        iocContainer
            .bind(firebaseType_1.SYMBOLS.API_KEY_VALIDATOR)
            .to(validationApiKey_1.ApiKeyValidator)
            .inSingletonScope();
    }
    if (!iocContainer.isBound(firebaseType_1.SYMBOLS.STORAGE_ADAPTER)) {
        iocContainer
            .bind(firebaseType_1.SYMBOLS.STORAGE_ADAPTER)
            .to(apiKeyStorage_1.InMemoryStorageAdapter)
            .inSingletonScope();
    }
    if (!iocContainer.isBound(firebaseType_1.SYMBOLS.CONTAINER_ADAPTER)) {
        iocContainer
            .bind(firebaseType_1.SYMBOLS.CONTAINER_ADAPTER)
            .to(ContainerAdapter)
            .inSingletonScope();
    }
    try {
        logger.debug('Binding ApiKeyManager', 'IoC-Config');
        if (!iocContainer.isBound(firebaseType_1.SYMBOLS.API_KEY_MANAGER)) {
            iocContainer
                .bind(firebaseType_1.SYMBOLS.API_KEY_MANAGER)
                .to(apiKeyManager_1.ApiKeyManager)
                .inSingletonScope();
        }
        const manager = iocContainer.get(firebaseType_1.SYMBOLS.API_KEY_MANAGER);
        const generatedKeys = [];
        await Promise.all(apiKeys.map(async (keyConfig) => {
            const keyResult = await manager.create(keyConfig.name, {
                scopes: keyConfig.scopes || [firebaseType_1.SecurityScopes.User],
                expiresAt: keyConfig.expiresAt
            });
            generatedKeys.push({
                name: keyConfig.name,
                key: keyResult.apiKey,
                scopes: keyResult.metadata.scopes,
                expiresAt: keyResult.metadata.expiresAt
            });
        }));
        logger.debug('Successfully created ApiKeyManager instance', 'IoC-Config', {
            apiKeyManager: manager,
            generatedKeys: generatedKeys.length
        });
        logger.debug('Binding API key Auth Strategy', 'IoC-Config');
        iocContainer
            .bind(firebaseType_1.registry.ApiKeyAuthStrategy)
            .toDynamicValue((context) => {
            try {
                const strategyLogger = context.container.get(firebaseType_1.SYMBOLS.CUSTOM_LOGGER);
                return new strategyAuth_1.ApiKeyAuthstrategy(manager, strategyLogger);
            }
            catch (error) {
                logger.error('Failed to initialize API key Auth Strategy', 'IoC-Config', { error });
                throw errorType_1.CustomError.create('Failed to initialize API key Auth Strategy', 500, { error });
            }
        })
            .inSingletonScope();
        logger.debug('Successfully binded API key Auth Strategy', 'IoC-Config');
        try {
            logger.debug('Binding AuthStrategyFactory', 'IoC-Config');
            iocContainer
                .bind(firebaseType_1.SYMBOLS.AUTH_STRATEGY_FACTORY)
                .to(strategyAuth_1.AuthStrategyFactory)
                .inSingletonScope();
            logger.debug('Successfully binded AuthStrategyFactory', 'IoC-Config');
        }
        catch (error) {
            logger.error('Failed to bind AuthStrategyFactory', 'IoC-Config', { errorDetails: error instanceof Error
                    ? {
                        errorMessage: error.message,
                        errorName: error.name
                    }
                    : 'Unknown error',
            });
            throw errorType_1.CustomError.create('Failed to bind AuthStrategyFactory', 500, { error });
        }
        return {
            apiKeyManager: manager,
            generatedKeys
        };
    }
    catch (error) {
        logger.error('Failed to bind ApiKeyManager', 'IoC-Config', { errorDetails: error instanceof Error
                ? {
                    errorMessage: error.message,
                    errorName: error.name
                }
                : 'Unknown error',
        });
        throw errorType_1.CustomError.create('Failed to bind ApiKeyManager', 500, { error });
    }
}
//# sourceMappingURL=iocConfig.js.map