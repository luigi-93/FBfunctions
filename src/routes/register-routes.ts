import express from 'express';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import { expressAuthentication } from '../api/tsoaAuth';
import { IRouteRegistrar, SYMBOLS } from '../utility/utilityKeys';
import { RegisterRoutes } from '../../build/api/routes';
import { inject, injectable } from 'inversify';
import { CustomLogger } from '../logging/customLogger';
import { CustomError } from '../errors/customError';

@injectable()
export class RouteRegistrar implements IRouteRegistrar {
    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private logger: CustomLogger
    ) {}

    register(app: express.Express, strategyFactory: AuthStrategyFactory) {
        this.logger.debug('RouteReigstrar.register() called', 'RouteRegistrar');
        this.logger.debug(`App instance received: ${app !== undefined}`, 'RouteRegistrar')
        this.logger.debug(`StrategyFactory instance received: ${strategyFactory !== undefined}`, 'RouteRegistrar')
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
            this.logger.debug('Calling Register Route', 'RouteRegistrar')
            RegisterRoutes(app);
            this.logger.debug('Register Route executed successfully', 'RouteRegistrar')
        } catch (error) {
            this.logger.error(
                'Error in calling Register Route', 
                'RouteRegistrar',
                {
                    errorDetaile: error instanceof Error
                    ? {
                        name: error.name,
                        message: error.message
                    }
                    : 'Unknow erro'
                })
            throw CustomError.create(
                'Feiled to call Register Route',
                500,
                {
                    error
                }
            )
        } finally {
            (global as any).expressAuthentication = originalAuth;
        }
    }
}
