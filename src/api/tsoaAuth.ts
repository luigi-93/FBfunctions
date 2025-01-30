import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import { AuthenticatedUser } from '../auth/userAuth';
import express from 'express';
import { CustomError } from '../errors/customError';



export async function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes: string[] = [],
    strategyFactory?: AuthStrategyFactory
): Promise<AuthenticatedUser> {
        try {

            if (!strategyFactory) {
                throw CustomError.create(
                    'Strategy factory not provided',
                    401,
                    { securityName }
                );
            }

            //const authStrategyFactory = iocContainer.get(AuthStrategyFactory)
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

            const strategy = strategyFactory.getStrategy(strategyName);
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