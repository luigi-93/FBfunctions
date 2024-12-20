//puo essere rimossa sostituita da apikeyManager.ts


import { 
    ApiKeyMetadata, 
    CustomClaims, 
    DecodedFirebaseToken, 
    FirebaseAuthProvider, 
    SecurityScopes } from "./firebaseType";
import { CustomLogger } from "./loggerType";
import { v4 as uuidv4 } from 'uuid';


export class ApikeyTokenGenerator {
    private static logger = CustomLogger.create();

    /**
     * Generate a mock DecodedFirebaseToken for API key authentication
     * @param apiKey the API key being used
     * @param metadata Optional metadata about the API key
     * @return DecodedFirebaseToken
     */
    static generateMockToken(
        apikey: string,
        metadata?: Partial<ApiKeyMetadata>
    ): DecodedFirebaseToken {
        // Defult metadata if not provided
        const defaultMetadata: ApiKeyMetadata = {
            id: uuidv4(),
            name: 'API Key Service Account',
            scopes: [SecurityScopes.User],
            provider: FirebaseAuthProvider.EMAIL_PASSWORD,
            createdAt: Math.floor(Date.now() / 1000)
        };

        // Merge provided metadata with defaults
        const mergedMetadata: ApiKeyMetadata = {
            ...defaultMetadata,
            ...metadata
        };

        const now = Math.floor(Date.now() / 1000);
        const expiresAt = mergedMetadata.expirestAt || (now + (24 * 60 * 60));


        try {
            return {
                // Standard Firebase token claims
                aud: process.env.FIREBASE_PROJECT_ID || 'default-project-id',
                exp: expiresAt,
                iat: now,
                iss: `https://securetoken.google.com/${process.env.FIREBASE_PROJECT_ID || 'default-project-id'}`,
                sub: mergedMetadata.id,

                // Custom claims
                uid: `apikey-${mergedMetadata.id.slice(0,8)}`,
                acl: mergedMetadata.scopes,
                name: mergedMetadata.name,
                email: `apikey-${mergedMetadata.id.slice(0,8)}@system.local`,

                // Additional metadata
                auth_time: now,
                firebase: {
                    identities: {},
                    sign_in_provider: mergedMetadata.provider || 'custom',
                    token_type: 'api_key',
                    api_key_id: mergedMetadata.id
                },

                // Additional custom claims
                ...(mergedMetadata.additionalClaims || {})
            };
        } catch (error) {
            this.logger.error(
                'Failed to generate mock token',
                'ApikeyTokenGenerator', {
                    error,
                    apikey: apikey.slice(0, 4) + '****'
                });
                throw error;
        }
    }

    /**
     * Create a persistent API key storage and management system
     */

    static createApiKeyManager() {
        const apiKeys: Record<string, ApiKeyMetadata> = {};
        const logger = CustomLogger.create();

        return {
            /**
             * Register a new API key
             * @param name Name or desciption of the API key
             * @param options Additional options for API key creation
             * @returns The generated API key and metadata
             */
            create(
                name: string,
                options: {
                    scopes?: SecurityScopes[];
                    provider?: FirebaseAuthProvider;
                    expiresAt?: number;
                    additionalClaims?: CustomClaims;
                } = {}
            ): { apiKey: string; metadata: ApiKeyMetadata } {
                const apiKey = `sk_${uuidv4()}`; 
                const metadata: ApiKeyMetadata = {
                    id: apiKey,
                    name,
                    scopes: options.scopes || [SecurityScopes.User],
                    provider: options.provider || FirebaseAuthProvider.EMAIL_PASSWORD,
                    createdAt: Math.floor(Date.now() / 1000),
                    expirestAt: options.expiresAt,
                    additionalClaims: options.additionalClaims
                };

                return { apiKey, metadata };
            },

            /**
             * retrieve API key metadata
             * @param apikey
             * @returns
             */
            get(apiKey: string): ApiKeyMetadata | undefined {
                const metedata = apiKeys[apiKey];
                if(!metedata) {
                    logger.warn('API Key not found', 'ApiKetManager', {
                        keyId: apiKey.slice(0,4)+ '****'
                    });
                }
                return metedata;
            },

            /**
             * Revoke an API key
             * @param apiKey
             */
            revoke(apiKey: string): void {
                if (apiKeys[apiKey]) {
                logger.info(
                    'API Key revoked',
                    'ApiKeyManager', {
                        keyId: apiKey.slice(0,4) + '****'
                    });
                    delete apiKeys[apiKey];
                } else {
                    logger.warn(
                        'Attempt to revoke non-existent API key',
                        'ApiKeyManager', {
                            keyId: apiKey.slice(0,4) + '****'
                        }
                    )
                }}
        }
    }
}

export const ApiKeyManager= ApikeyTokenGenerator.createApiKeyManager();