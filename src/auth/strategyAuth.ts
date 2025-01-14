import { inject, injectable, LazyServiceIdentifier } from 'inversify';
import { 
    ApiKeyMetadata, 
    DecodedFirebaseToken, 
    IAuthStrategy, 
    SecurityScopes, 
    StrategyName, 
    StrategyRegistry, 
    SYMBOLS} 
    from '../utility/firebaseType';
import { CustomError } from '../utility/errorType';
import { CustomLogger } from '../utility/loggerType';
import express from 'express';
import { AuthenticatedUser } from './userAuth';
import * as admin from 'firebase-admin';
import { ApiKeyManager } from '../services/apiKeyManager';
import { ContainerAdapter } from '../ioc/iocConfig';


@injectable()
export class AuthStrategyFactory {
    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private logger: CustomLogger,
        @inject(new LazyServiceIdentifier(() => SYMBOLS.CONTAINER_ADAPTER)) private ioc: ContainerAdapter   
    ) {}

    getStrategy(name: StrategyName): IAuthStrategy {
        if(!name) {
            this.logger.warn(
                'Strategy name not provided',
                'AuthStrategyFactory'
            );
            throw CustomError.create(
                'strategy name is reuired',
                400,
                {details: 'The strategy name parameter was not provided.'});
        }

        const strategySymbol = StrategyRegistry[name];
        if (!strategySymbol) {
            this.logger.warn(
               `Strategy ${name} not found in registry`,
               'AuthStrategyFactory' 
            );
            throw CustomError.create(
                `Authentication strategy ${name} not found`,
                403,
                {
                    name,
                    availableStrategies: Object.keys(StrategyRegistry),
                }
            );
        }

        try {
            const strategy = this.ioc.get<IAuthStrategy>(strategySymbol);

            this.logger.info(
                `Successfully resolved strategy: ${name}`,
                'AuthStrategyFactory',
                { strategyName: name }
            );
            return strategy;
            
        } catch (error) {
            this.logger.error(
                `Failed to resolve strategy: ${name}`,
                'AuthStrategyFactory',
                {
                    errorDetails: error instanceof Error 
                    ? error.message 
                    : 'Unknown error',
                }
            );
            throw CustomError.create(
                'Failed to initialize authentication strategy',
                500,
                {
                    strategy: name,
                    error: error instanceof Error
                    ? error.message
                    : 'Unknown error'
                }
            )
        }
    }

}

export abstract class BaseAuthStrategy implements IAuthStrategy {
    protected logger: CustomLogger;
    constructor(logger?: CustomLogger) {
        this.logger = logger || new CustomLogger();
    }

    abstract authenticate(
        request: express.Request, 
        securityName: string, 
        scopes: string[]): Promise<AuthenticatedUser>;

    protected validateScopes(
        user: AuthenticatedUser,
        request: express.Request,
        requiredScopes: string[],
    ): void {
        // Enhanced scope validation
        if (requiredScopes.length === 0) {
            this.logger.debug(
                'No scope validation required',
                'BaseAuthStrategy.validateScopes',
                {
                    userId: user.getCustomClaim('uid')
                }
            );
            return;
        } 
        
        this.logger.debug(
            'Starting scope validation',
            'BaseAuthStrategy.validateScoopes',
            {
                requiredScopes,
                userId: user.getCustomClaim('uid')
            }
        );

        user.isAllowedTo(request, {
            requiredScopes: requiredScopes as SecurityScopes[]
        });

        this.logger.debug(
            'Scope validation successful',
            'BaseAuthStrategy.validateScopes',
            {
                requiredScopes,
                userId: user.getCustomClaim('uid')
            }
        );
    }
}

@injectable()
export class FirebaseJwtAuthStrategy extends BaseAuthStrategy {
    private firebaseAdmin: typeof admin;

    constructor(
        firebaseAdmin: typeof admin,
        logger?: CustomLogger
    ) {
        super(logger);
        this.firebaseAdmin = firebaseAdmin;
    }

    async authenticate(
        request: express.Request, 
        securityName: string, 
        scopes: string[] = []): Promise<AuthenticatedUser> {
            
            // Separate method for token extraction
            const bearerToken = this.extraBearerToken(request);

            // Validate security name (optional)
            this.validateSecurityName(securityName);

            try {
                // Verify Firebase JWT
                const firebaseTokenParsed = await this.verifyFirebaseToken(bearerToken);

                // Create authenticated user
                const authnticatedUser = new AuthenticatedUser(firebaseTokenParsed);

                // Validate scopes
                this.validateScopes(authnticatedUser, request, scopes);

                return authnticatedUser;
            } catch (error) {
                this.handleAuthenticationError(error)
            }
        
    }

    private extraBearerToken(request: express.Request): string {
        const authHeader = request?.headers?.authorization;
        const bearerToken = authHeader?.split('Bearer ')?.[1];

        if (!bearerToken) {
            this.logger.warn('No bearer token', 'FirebaseJwtAuthStrategy');
            throw CustomError.create(
                'No bearer token provided',
                401,
                { reason: 'Missing Authorization header'}
            );
        }

        return bearerToken;
    }

    private validateSecurityName(securityName: string): void {
        if (securityName !== 'JWT') {
            throw CustomError.create(
                'Invalid security name',
                401,
                { securityName }
            );
        }
    }

    private async verifyFirebaseToken(token: string): Promise<DecodedFirebaseToken> {
        try {
            const decodedToken = await this.firebaseAdmin.auth().verifyIdToken(token, true);
        
            //Extend DecodedIdToken to match DecodedFirebaseToken
            const extendedToken: DecodedFirebaseToken = {
                ...decodedToken,
                acl: [],
                name: decodedToken.name || 'Uknown User', //most probability uknown
                email: decodedToken.email || '',
                firebase: {
                    ...decodedToken.firebase,
                    sign_in_provider: decodedToken.firebase?.sign_in_provider || 'unknown',
                    token_type: 'id_token',
                },
            };

            return extendedToken;
        
        
        } catch (error) {
            this.logger.error(
                'Firebase token verification failed',
                'FirebaseJwtAuthStrategy',
                {
                    errorMessage: error instanceof Error
                    ? error.message
                    : 'Unknow error'
                }
            );

            throw CustomError.create(
                'Token verification failed',
                403,
                { 
                    reason: 'Invalid Firebase token',
                    error: error
                }
            )
        }
    }

    private handleAuthenticationError(error: unknown): never {
        //Differentiate between different type of errors
        if (error instanceof CustomError) {
            throw error
        }

        const errorMessage = error instanceof Error
            ? error.message
            : 'Uknow validation error';

        // Map Firebase-specific errors
        if (errorMessage.includes('ID token has expired')) {
            throw CustomError.create(
                'Token expired',
                401,
                { reason : 'Firebase ID token has expired'}
            );
        }

        if (errorMessage.includes('Firebase ID token has incorrect')) {
            throw CustomError.create(
                'Invalid token',
                403,
                { reason: 'Firebase ID token is incorrect'}
            );
        }

        throw CustomError.create(
            'Authentication failed',
            403,
            {
                reason: errorMessage,
                originalError: error
            }
        );
    }

    async refreshToken(token: string): Promise<string> {
        try {
            const decodedToken = await this.verifyFirebaseToken(token);
            // Implement token refresh logic using firebase admin SDK
            // This might involve creating a new token or extending the existing one
            return await this.firebaseAdmin.auth().createCustomToken(decodedToken.uid)
        } catch (error) {
            this.logger.error(
                'Token refresh failed',
                'FirebaseJwtAuthStrategy',
                { error }
            );
            throw CustomError.create(
                'Token refresh failed',
                403,
                { reason: 'Unable to refresh token'}
            );
        }
    }
}

@injectable()
export class ApiKeyAuthstrategy extends BaseAuthStrategy {
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
                'ApiKeyAuthStrategy', {
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
