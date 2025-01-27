import { ApiKeyManager } from "../services/apiKeyManager";
import { CustomError } from "../errors/customError";
import { DecodedFirebaseToken } from "../utility/firebaseType";
import { ApiKeyMetadata } from "../utility/firebaseType";
import { BaseAuthStrategy } from "./strategyHelpers";
import { injectable } from "inversify";
import { CustomLogger } from "../logging/customLogger";
import express from 'express';
import { AuthenticatedUser } from "../auth/userAuth";


@injectable()
export class FirebaseApiKeyAuthStrategy extends BaseAuthStrategy {
    private apiKeyManager: ApiKeyManager;
    

    constructor(
        apiKeyManager: ApiKeyManager,
        logger?: CustomLogger
    ) {
        super(logger);
        this.apiKeyManager = apiKeyManager;
       
    }

    async authenticate(
        request: express.Request,
        securityName: string,
        scopes: string[] = []
    ): Promise<AuthenticatedUser> {
         
        //Improved API key extraction
        const apikey = this.extractApiKey(request);

        if(!apikey) {
            this.logger.warn(
                'API key extration failed', 
                'ApiKeyAuth');
            throw CustomError.create(
                'No API key provided',
                401,
                { reason: 'Missing API key'}
            );
        }

        // Validate and retrive API key metadata
        const keyMetadata = await this.validateApiKey(apikey);

        // Generate mock token
        const mockDecodeToken = this.generateMockToken(apikey, keyMetadata);

        // Create authenticated user
        const mockUser = new AuthenticatedUser(mockDecodeToken);

        // Validate scopes 
        this.validateScopes(mockUser, request, scopes);

        return mockUser;
       
    }


    private extractApiKey(request: express.Request): string | undefined {
        return  typeof request.headers['x-api-key'] === 'string' 
            ? request.headers['x-api-key']
            : typeof request.query.apiKey === 'string'
            ? request.query.apiKey
            : undefined;
    }

    private async validateApiKey(apiKey: string): Promise<ApiKeyMetadata> {
        const keyMetadata = await this.apiKeyManager.get(apiKey);

        if (!keyMetadata) {
            this.logger.error(
                'Invalid API key',
                'FirebaseApiKeyAuthStrategy', {
                    keyId: this.maskApiKey(apiKey)
            });
            throw CustomError.create(
                'Authenctication failed',
                403,
                { 
                    reason: 'Unauthorized API key',
                    errorCode: 'API_KEY_INVALID'
                }
            );
        }

        const currentTimestamp = Math.floor(Date.now() / 1000);
        // Optional: Add Additional validation (e.g., expiration check)
        if (keyMetadata.expiresAt && currentTimestamp > keyMetadata.expiresAt) {
            this.logger.warn(
                'Expired API key',
                'ApiKeyAuth', {
                    keyId: this.maskApiKey(apiKey),
                    expirationTime: keyMetadata.expiresAt
                });
                throw CustomError.create(
                    'Authentication failed',
                    403,
                    { 
                        reason: 'API key has expired',
                        errorCode: 'API_KEY_EXPIRED'
                     }
                );
        }

        if (!keyMetadata.status || keyMetadata.status !== 'ACTIVE') {
            this.logger.warn(
                'Inactive API key',
                'ApiKeyAuth',
                {
                    keyId: this.maskApiKey(apiKey),
                    status: keyMetadata.status
                }
            );
            throw CustomError.create(
                'Authenrication failed',
                403,
                {
                    reason: 'API key is not acitve',
                    errorCode: 'API_KEY_INACTIVE'
                }
            )
        }

        return keyMetadata;

    }

    private generateMockToken(
        apiKey: string,
        metadata: ApiKeyMetadata
    ): DecodedFirebaseToken {
        return this.apiKeyManager.generateMockToken(apiKey, metadata);
    }


    private maskApiKey(apiKey: string): string {
        return apiKey.slice(0, 4) + apiKey.slice(-4);
    }
}
