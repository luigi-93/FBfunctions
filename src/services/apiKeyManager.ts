import { CustomError } from "../utility/errorType";
import { 
    ApiKeyMetadata, 
    ApiKeyStorageAdapter, 
    CustomClaims, 
    DecodedFirebaseToken, 
    FirebaseAuthProvider, 
    SecurityScopes } from "../utility/firebaseType";
import { CustomLogger } from '../utility/loggerType';
import { ApiKeyValidator } from "../validation/validationApiKey";
import { InMemoryStorageAdapter } from "./apiKeyStorage";
import * as crypto from 'crypto';


export class ApikeyManager {
    private storageAdapter: ApiKeyStorageAdapter;
    private validator: ApiKeyValidator;
    private logger: CustomLogger;
    private keyRotationInterval = 30 * 24 * 60 * 60; // 30 days

    constructor(
        storageAdapter?: ApiKeyStorageAdapter,
        logger?: CustomLogger
    ) {
        this.storageAdapter = storageAdapter || new InMemoryStorageAdapter();
        this.validator = new ApiKeyValidator(logger);
        this.logger = logger || CustomLogger.create();
    }

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
            expirestAt: options.expiresAt || (now + this.keyRotationInterval),
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
                'ApikeyManager',
                {
                    error,
                    name
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
                    'ApiKeymanager',
                    {
                        keyId: apiKey.slice(0, 4) + '****'
                    });
                return undefined;
            }

            if (!this.validator.validate(metadata)) {
                this.logger.warn(
                    'API key validation failed',
                    'ApikeyManagere',
                    {
                        keyId: apiKey.slice(0, 4) + '****'
                    });
                return undefined;
            } 

            return metadata;

        } catch (error) {
            this.logger.error(
                'Error retrieving API key',
                'ApikeyManager',
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
                    'API key rovoked',
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
                'ApikeyManager',
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
                'ApikeyManager'
            );
        } catch (error) {
            this.logger.error(
                'Failed to prune expired kets',
                'ApiKEyManager',
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
        const expiresAt = metadata.expirestAt || (now + (24 * 60 * 60));

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

export const ApiKeyManagerInstance = new ApikeyManager()