import { inject, injectable } from "inversify";
import { CustomError } from "../utility/errorType";
import { ApiKeyMetadata, ApiKeyStorageAdapter, SYMBOLS } from "../utility/firebaseType";
import { CustomLogger } from "../utility/loggerType";

@injectable()
export class InMemoryStorageAdapter implements ApiKeyStorageAdapter {
    private apiKeys: Record<string, ApiKeyMetadata> = {};
   
    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private readonly logger: CustomLogger
    ) {}

    async save(apiKey: string, metadata: ApiKeyMetadata): Promise<void> {
        try {
            this.apiKeys[apiKey] = metadata;
            this.logger.info(
                'API Key saved successfully',
                'InMemoryStorageAdapter',
                { apiKey }) 
        } catch (error) {
            this.logger.error(
                'Failed to save API key',
                'InMemoryStorageAdapter', 
                {
                    apiKey,
                    error
                });
            throw CustomError.create(
                'Error saving API key',
                500,
                { apiKey });
        }
    }

    async get(apiKey: string): Promise<ApiKeyMetadata | undefined> {
        try {
            const metadata = this.apiKeys[apiKey];
            if (!metadata) {
                this.logger.warn(
                    'API Key not found',
                    'InMemoryStorageAdapter',
                    { apiKey });
            }
            return metadata;
        } catch (error) {
            this.logger.error(
                'Failed to retrive API key',
                'InMemoryStorageAdapter',
                { apiKey, error });
            throw CustomError.create(
                'Error retrieving API key',
                500,
                { apiKey });
        }
    }

    async revoke(apiKey: string): Promise<void> {
        try {
            if (!this.apiKeys[apiKey]){
                this.logger.warn(
                    'Attempted to revoke non-existent API key',
                    'InMemoryStorageAdapter',
                { apiKey });
                throw CustomError.create(
                    'API Key not found for revocation',
                    404,
                    { apiKey });
            }
            delete this.apiKeys[apiKey];
            this.logger.info(
                'API Key revoked successfully',
                'InMemoryStorageAdapter',
                { apiKey});
        } catch (error) {
            this.logger.error(
                'Failed to revoke API key',
                'InMemoryStorageAdapter',
                { apiKey, error });
            throw error instanceof CustomError 
            ? error
            : CustomError.create(
                'Error revoking API key',
                500,
                { apiKey });
        }
    }
    async listAll(): Promise<Record<string, ApiKeyMetadata>> {
        try {
            this.logger.info('Listing all API Keys', 'InMemoryDtorageAdapter');
            return { ...this.apiKeys };
        } catch (error) {
            this.logger.error(
                'Failed to list all API Keys',
                'InMemoryStorageAdapter',
                { error });

            throw CustomError.create(
                'Error listing API Keys',
                500,
                {})
        }
    }

    async prune(): Promise<void> {
        try {
            const now = Math.floor(Date.now() / 1000);
            const keysToDelete = Object.keys(this.apiKeys).filter(key => {
                const metadata = this.apiKeys[key];
                return metadata.expiresAt && metadata.expiresAt < now;
            });

            keysToDelete.forEach(key => {
                delete this.apiKeys[key];
                this.logger.info(
                    'Pruned expired API Key',
                    'InMemoryStorageAdapter', 
                    {
                        apiKey: key
                    });            
            });

            if (keysToDelete.length === 0) {
                this.logger.info(
                    'No expired API Keys to prune',
                    'InMemoryStorageAdapter');
            }
        } catch (error) {
            this.logger.error(
                'Failed to prone expired API Keys',
                'InMemoryStorageAdapter',
                { error });
            throw CustomError.create('Error pruning API Keys', 500, {})    
        }
    }
    
}