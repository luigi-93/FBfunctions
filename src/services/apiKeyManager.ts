import { inject, injectable } from "inversify";
import { CustomError } from "../errors/customError";
import { 
    ApiKeyMetadata, 
    ApiKeyStorageAdapter, 
    CustomClaims, 
    DecodedFirebaseToken, 
    FirebaseAuthProvider, 
    SecurityScopes, 
    SYMBOLS} from "../utility/utilityKeys";
import { CustomLogger } from '../logging/customLogger';
import { ApiKeyValidator } from "../validation/validationApiKey";
import * as crypto from 'crypto';


@injectable()
export class ApiKeyManager {
    private keyRotationInterval = 30 * 24 * 60 * 60; // 30 days

    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private logger: CustomLogger,
        @inject(SYMBOLS.STORAGE_ADAPTER) private storageAdapter: ApiKeyStorageAdapter,
        @inject(SYMBOLS.API_KEY_VALIDATOR) private validator: ApiKeyValidator,
        
    ) {}

    /**
     * Create a new API key
     * @param name Name or description of the API key
     * @param options Additional options for key creation
     * @returns Created API key and its metadata
     */
    async create(
        name: string,
        options: {
            scopes?: SecurityScopes[];
            provider?: FirebaseAuthProvider;
            expiresAt?: number;
            additionalClaims?: CustomClaims;
        } = {}
    ): Promise<{ apiKey: string; metadata: ApiKeyMetadata}> {
        const apiKey = this.generateSecureApiKey();
        const now = Math.floor(Date.now() / 1000);

        const metadata: ApiKeyMetadata = {
            id: apiKey,
            name,
            scopes: options.scopes || [SecurityScopes.User],
            provider: options.provider || FirebaseAuthProvider.EMAIL_PASSWORD,
            createdAt: now,
            expiresAt: options.expiresAt || (now + this.keyRotationInterval),
            status: 'ACTIVE',
            additionalClaims: options.additionalClaims
        };

        try {
            await this.storageAdapter.save(apiKey, metadata);

            this.logger.info(
                'API Key created',
                'ApiKeyManager',
                {
                    keyId: apiKey.slice(0, 4) + '****',
                    name: metadata.name
                });

            return { apiKey, metadata };
        } catch (error) {
            this.logger.error(
                'Failed to create API key',
                'ApiKeyManager',
                {
                    errorDetails: error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message,
                    }
                    : 'Unknown error',
                    keyName: name
                });
                throw CustomError.create(
                    'Failed to create API key',
                    500 ,
                    { error });
        }
    }

    /**
     * retriive API key metadata
     * @param apiKey The API key to retrieve
     * @returns API key metadata or undefined
     */
    async get(apiKey: string): Promise<ApiKeyMetadata | undefined> {
        
        try {
            const metadata = await this.storageAdapter.get(apiKey);

            if (!metadata) {
                this.logger.warn(
                    'API key not found',
                    'ApiKeyManager',
                    {
                        keyId: apiKey.slice(0, 4) + '****'
                    });
                throw CustomError.create(
                    'API key not found',
                    404,
                    { keyId: apiKey.slice(0, 4) + '****' });
            }

            if (!this.validator.validate(metadata)) {
                this.logger.warn(
                    'API key validation failed',
                    'ApiKeyManager',
                    {
                        keyId: apiKey.slice(0, 4) + '****'
                    });
                throw CustomError.create(
                    'API key validation failed',
                    401,
                    { keyId: apiKey.slice(0, 4) + '****' });
            } 

            return metadata;

        } catch (error) {
            this.logger.error(
                'Error retrieving API key',
                'ApiKeyManager',
                {
                    error,
                    keyId: apiKey.slice(0,4) + '****'
                });

            return undefined;
        }
    }

    /**
     * Revoke an API key
     * @param apiKey The API key to revoke
     */
    async revoke(apiKey: string): Promise<void> {

        try{
            const metadata = await this.storageAdapter.get(apiKey);

            if (metadata) {
                metadata.status = 'REVOKED';
                await this.storageAdapter.save(apiKey, metadata);

                this.logger.info(
                    'API key revoked',
                    'ApiKeyManager',
                    {
                        keyId: apiKey.slice(0, 4) + '****'
                    });
            } else {
                this.logger.warn(
                    'Attempted to revoke non-existent API key',
                    'ApiKeyManager',
                    {
                        keyId: apiKey.slice(0,4) + '****'
                    });
            }
        } catch (error) {
            this.logger.error(
                'Error revoking API key',
                'ApiKeyManager',
                {
                    error,
                    keyId: apiKey.slice(0, 4) + '****'
                });
            throw CustomError.create(
                'Failed to revoke API key',
                500,
                { error });
        }
    }

    /**
     * Rotate an exitiing API key
     * @param existingApiKey The current API key to rotate
     * @param options Rotation options
     * @returns New API key and metadata
     */

    async rotateKey(
        existingApiKey: string,
        options?: {
            revokeOld?: boolean;
            transferScopes?: boolean;
        }
    ): Promise<{newApiKey: string; metadata: ApiKeyMetadata }> {
        
        try {
            const oldMetadata = await this.get(existingApiKey);

            if(!oldMetadata) {
                throw CustomError.create(
                    'API key not found for rotation',
                    404,
                    { existingApiKey });
            }      


            const newKeyMetadata = {
                scopes: options?.transferScopes 
                ? oldMetadata?.scopes
                : undefined,
                additionalClaims: options?.transferScopes
                ? oldMetadata?.additionalClaims
                : undefined
            }
        
            const { apiKey: newApiKey, metadata: newMetadata } = 
            await this.create(
                `Rotated: ${oldMetadata?.name}`,
                newKeyMetadata
            
            );

            if (options?.revokeOld) {
                await this.revoke(existingApiKey);
            }
            
            return { newApiKey, metadata: newMetadata}
        } catch (error) {
            this.logger.error(
                'Key rotation failed',
                'ApiKeyManager',
                { error }
            )
            throw CustomError.create(
                'Key rotation failed',
                500,
                { error });
        }
    }

    /**
     * Prune expired API keys
     */
    async pruneExpiredKeys(): Promise<void> {
        try {
            await this.storageAdapter.prune();
            this.logger.info(
                'Expired API keys pruned',
                'ApiKeyManager'
            );
        } catch (error) {
            this.logger.error(
                'Failed to prune expired keys',
                'ApiKeyManager',
                { error });
            throw CustomError.create(
                'Failed to prune expired keys',
                500,
                { error }
            );
        }
        
    }

     /**
     * Generate a mock token for API key authentication
     * @param apiKey The API key
     * @param metadata API key metadata
     * @returns Decoded Firebase token
     */
    generateMockToken(
        apiKey: string,
        metadata: ApiKeyMetadata
    ): DecodedFirebaseToken {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = metadata.expiresAt || (now + (24 * 60 * 60));

        return {
            aud: process.env.FIREBASE_PROJECT_ID || 'default-project-id',
            exp: expiresAt,
            iat: now,
            iss: `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID || 'default-project-id'}`,
            sub: metadata.id,
            uid: `apikey-${metadata.id.slice(0, 8)}`,
            acl: metadata.scopes,
            name: metadata.name,
            email: `apikey-${metadata.id.slice(0, 8)}@system.local`,
            auth_time: now,
            firebase: {
                identities: {},
                sign_in_provider: metadata.provider || 'custom',
                token_type: 'api_key',
                api_key_id: metadata.id
            },
            ...(metadata.additionalClaims || {})
        };
    }

    /**
     * Generate a secure API key
     * @returns Secure API key string
     */
    private generateSecureApiKey(): string {
        return `sk_${crypto.randomBytes(16).toString('hex')}`;
    }
}

