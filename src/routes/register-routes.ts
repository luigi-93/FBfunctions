import express from 'express';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import { expressAuthentication } from '../api/tsoaAuth';
import { IRouteRegistrar } from '../utility/utilityKeys';
import { RegisterRoutes } from '../../build/api/routes';
import { injectable } from 'inversify';

@injectable()
export class RouteRegistrar implements IRouteRegistrar {
    register(app: express.Express, strategyFactory: AuthStrategyFactory) {
        // Store strategy in app locals
        app.locals.strategyFactory = strategyFactory;

        // Temporary overide of authentication handler
        const originalAuth = (global as any).expressAuthentication;

        (global as any).expressAuthentication = (
            request: express.Request,
            securityName: string,
            scopes: string[]
        ) => {
            const factory = app.locals.strategyFactory = strategyFactory;
            return expressAuthentication(
                request, 
                securityName, 
                scopes, 
                factory
            );
        }; 

        try {
            RegisterRoutes(app);
        } finally {
            (global as any).expressAuthentication = originalAuth;
        }
    }
}
