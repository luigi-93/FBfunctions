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
exports.InMemoryStorageAdapter = void 0;
const inversify_1 = require("inversify");
const customError_1 = require("../errors/customError");
const utilityKeys_1 = require("../utility/utilityKeys");
const customLogger_1 = require("../logging/customLogger");
let InMemoryStorageAdapter = class InMemoryStorageAdapter {
    constructor(logger) {
        this.logger = logger;
        this.apiKeys = {};
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
            throw customError_1.CustomError.create('Error saving API key', 500, { apiKey });
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
            throw customError_1.CustomError.create('Error retrieving API key', 500, { apiKey });
        }
    }
    async revoke(apiKey) {
        try {
            if (!this.apiKeys[apiKey]) {
                this.logger.warn('Attempted to revoke non-existent API key', 'InMemoryStorageAdapter', { apiKey });
                throw customError_1.CustomError.create('API Key not found for revocation', 404, { apiKey });
            }
            delete this.apiKeys[apiKey];
            this.logger.info('API Key revoked successfully', 'InMemoryStorageAdapter', { apiKey });
        }
        catch (error) {
            this.logger.error('Failed to revoke API key', 'InMemoryStorageAdapter', { apiKey, error });
            throw error instanceof customError_1.CustomError
                ? error
                : customError_1.CustomError.create('Error revoking API key', 500, { apiKey });
        }
    }
    async listAll() {
        try {
            this.logger.info('Listing all API Keys', 'InMemoryDtorageAdapter');
            return { ...this.apiKeys };
        }
        catch (error) {
            this.logger.error('Failed to list all API Keys', 'InMemoryStorageAdapter', { error });
            throw customError_1.CustomError.create('Error listing API Keys', 500, {});
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
            throw customError_1.CustomError.create('Error pruning API Keys', 500, {});
        }
    }
};
exports.InMemoryStorageAdapter = InMemoryStorageAdapter;
exports.InMemoryStorageAdapter = InMemoryStorageAdapter = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.CUSTOM_LOGGER)),
    __metadata("design:paramtypes", [customLogger_1.CustomLogger])
], InMemoryStorageAdapter);
//# sourceMappingURL=apiKeyStorage.js.map