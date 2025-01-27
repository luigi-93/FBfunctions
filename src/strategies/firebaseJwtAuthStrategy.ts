import { CustomError } from "../errors/customError";
import { BaseAuthStrategy } from "./strategyHelpers";
import { injectable } from "inversify";
import * as admin from 'firebase-admin';
import { CustomLogger } from "../logging/customLogger";
import express from 'express';
import { AuthenticatedUser } from "../auth/userAuth";
import { DecodedFirebaseToken } from "../utility/firebaseType";

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