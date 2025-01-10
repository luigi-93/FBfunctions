"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStorageAdapter = void 0;
const errorType_1 = require("../utility/errorType");
const loggerType_1 = require("../utility/loggerType");
class InMemoryStorageAdapter {
    constructor(logger) {
        this.apiKeys = {};
        this.logger = logger || loggerType_1.CustomLogger.create();
    }
    async save(apiKey, metadata) {
        try {
            this.apiKeys[apiKey] = metadata;
            this.logger.info('API Key saved successfully', 'InMemoryStorageAdapter', { apiKey });
        }
        catch (error) {
            this.logger.error('Failed to save API key', 'InMemoryStorageAdapter', {
                apiKey,
                error
            });
            throw errorType_1.CustomError.create('Error saving API key', 500, { apiKey });
        }
    }
    async get(apiKey) {
        try {
            const metadata = this.apiKeys[apiKey];
            if (!metadata) {
                this.logger.warn('API Key not found', 'InMemoryStorageAdapter', { apiKey });
            }
            return metadata;
        }
        catch (error) {
            this.logger.error('Failed to retrive API key', 'InMemoryStorageAdapter', { apiKey, error });
            throw errorType_1.CustomError.create('Error retrieving API key', 500, { apiKey });
        }
    }
    async revoke(apiKey) {
        try {
            if (!this.apiKeys[apiKey]) {
                this.logger.warn('Attempted to revoke non-existent API key', 'InMemoryStorageAdapter', { apiKey });
                throw errorType_1.CustomError.create('API Key not found for revocation', 404, { apiKey });
            }
            delete this.apiKeys[apiKey];
            this.logger.info('API Key revoked successfully', 'InMemoryStorageAdapter', { apiKey });
        }
        catch (error) {
            this.logger.error('Failed to revoke API key', 'InMemoryStorageAdapter', { apiKey, error });
            throw error instanceof errorType_1.CustomError
                ? error
                : errorType_1.CustomError.create('Error revoking API key', 500, { apiKey });
        }
    }
    async listAll() {
        try {
            this.logger.info('Listing all API Keys', 'InMemoryDtorageAdapter');
            return { ...this.apiKeys };
        }
        catch (error) {
            this.logger.error('Failed to list all API Keys', 'InMemoryStorageAdapter', { error });
            throw errorType_1.CustomError.create('Error listing API Keys', 500, {});
        }
    }
    async prune() {
        try {
            const now = Math.floor(Date.now() / 1000);
            const keysToDelete = Object.keys(this.apiKeys).filter(key => {
                const metadata = this.apiKeys[key];
                return metadata.expiresAt && metadata.expiresAt < now;
            });
            keysToDelete.forEach(key => {
                delete this.apiKeys[key];
                this.logger.info('Pruned expired API Key', 'InMemoryStorageAdapter', {
                    apiKey: key
                });
            });
            if (keysToDelete.length === 0) {
                this.logger.info('No expired API Keys to prune', 'InMemoryStorageAdapter');
            }
        }
        catch (error) {
            this.logger.error('Failed to prone expired API Keys', 'InMemoryStorageAdapter', { error });
            throw errorType_1.CustomError.create('Error pruning API Keys', 500, {});
        }
    }
}
exports.InMemoryStorageAdapter = InMemoryStorageAdapter;
//# sourceMappingURL=apiKeyStorage.js.map