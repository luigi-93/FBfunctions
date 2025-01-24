import { inject, injectable, LazyServiceIdentifier } from 'inversify';
import { 
    IAuthStrategy, 
    SecurityScopes, 
    StrategyName, 
    StrategyRegistry, 
    SYMBOLS} 
    from '../utility/firebaseType';
import { CustomError } from '../errors/CustomError';
import { CustomLogger } from '../logging/CustomLogger';
import express from 'express';
import { AuthenticatedUser } from '../auth/userAuth';
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

