"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IoCSetup = IoCSetup;
const firebaseType_1 = require("../utility/firebaseType");
const apiKeyManager_1 = require("../services/apiKeyManager");
const customError_1 = require("../errors/customError");
const validationApiKey_1 = require("../validation/validationApiKey");
const apiKeyStorage_1 = require("../services/apiKeyStorage");
const setAuth_1 = require("../auth/setAuth");
const strategyHelpers_1 = require("../strategies/strategyHelpers");
const firebaseJwtAuthStrategy_1 = require("../strategies/firebaseJwtAuthStrategy");
const firebaseApiKeyAuthStrategy_1 = require("../strategies/firebaseApiKeyAuthStrategy");
const iocHelpers_1 = require("./iocHelpers");
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
                return new firebaseJwtAuthStrategy_1.FirebaseJwtAuthStrategy(firebaseAdmin, strategyLogger);
            }
            catch (error) {
                logger.error('Failed to initialize Firebase Jwt Authentication Strategy', 'IoC-Config', { error });
                throw customError_1.CustomError.create('Failed to initialize Firebase Jwt Authentication Strategy', 500, { error });
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
        throw customError_1.CustomError.create('Failed to setup Firebase Authentication dependencies', 500, { error });
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
            .to(iocHelpers_1.ContainerAdapter)
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
        logger.debug('Binding firebase API key Auth Strategy', 'IoC-Config');
        iocContainer
            .bind(firebaseType_1.registry.FirebaseApiKeyAuthStrategy)
            .toDynamicValue((context) => {
            try {
                const strategyLogger = context.container.get(firebaseType_1.SYMBOLS.CUSTOM_LOGGER);
                return new firebaseApiKeyAuthStrategy_1.FirebaseApiKeyAuthStrategy(manager, strategyLogger);
            }
            catch (error) {
                logger.error('Failed to initialize firebase API key Auth Strategy', 'IoC-Config', {
                    errorDetails: error instanceof Error
                        ? {
                            name: error.name,
                            message: error.message
                        }
                        : 'Unknow error'
                });
                throw customError_1.CustomError.create('Failed to initialize firebase API key Auth Strategy', 500, { error });
            }
        })
            .inSingletonScope();
        logger.debug('Successfully binded firebase API key Auth Strategy', 'IoC-Config');
        try {
            logger.debug('Binding AuthStrategyFactory', 'IoC-Config');
            iocContainer
                .bind(firebaseType_1.SYMBOLS.AUTH_STRATEGY_FACTORY)
                .to(strategyHelpers_1.AuthStrategyFactory)
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
            throw customError_1.CustomError.create('Failed to bind AuthStrategyFactory', 500, { error });
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
        throw customError_1.CustomError.create('Failed to bind ApiKeyManager', 500, { error });
    }
}
//# sourceMappingURL=iocConfig.js.map