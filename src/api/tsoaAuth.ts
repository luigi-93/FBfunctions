import { AuthStrategyFactory } from '../strategies/authHelpers';
import { AuthenticatedUser } from '../auth/userAuth';
import { iocContainer } from '../ioc';
import express from 'express';
import { CustomError } from '../errors/customError';



export async function expressAuthentication(
    request:express.Request,
    securityName: string,
    scopes: string[] = []): Promise<AuthenticatedUser> {
        try {

            const authStrategyFactory = iocContainer.get(AuthStrategyFactory)
            //Map security names from tsoa.json to your strategy registry
            if (!['jwt', 'apikey'].includes(securityName.toLowerCase())) {
                throw CustomError.create(
                    'Invalid security scheme',
                    401,
                    { 
                        securityName,
                        supportedSchemes: ['jwt', 'apikey']
                    }
                );

            } const strategyName = securityName.toLowerCase() === 'jwt'
                ? 'FirebaseJwtAuthStrategy'
                : 'ApiKeyStrategy';

            const strategy = authStrategyFactory.getStrategy(strategyName);
            return await strategy.authenticate(request, securityName, scopes);
        } catch (error) {

                 throw CustomError.create(
                'AUthentication failed',
                401,
                { 
                    originalError: error instanceof Error ? error.message : 'Unknown error',
                    securityName 
                }
            );
        }
    
}