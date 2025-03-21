import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import { AuthenticatedUser } from '../auth/userAuth';
import express from 'express';
import { CustomError } from '../errors/customError';
import { container } from '../ioc/index';
import { SYMBOLS } from '../utility/utilityKeys';

export async function expressAuthentication(
    request: express.Request,
    securityName: string,
    scopes: string[] = [],
    //strategyFactory?: AuthStrategyFactory
): Promise<AuthenticatedUser> {
        try {

            const strategyFactory = container.get<AuthStrategyFactory>(SYMBOLS.AUTH_STRATEGY_FACTORY);

            if (!strategyFactory) {
                throw CustomError.create(
                    'Strategy factory not provided',
                    401,
                    { securityName }
                );
            }

            console.log("strategyFactory type:", typeof strategyFactory);
            console.log("strategyFactory has getStrategy:", typeof strategyFactory.getStrategy === 'function');

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
                console.error("Authenticated error details: ", error)
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