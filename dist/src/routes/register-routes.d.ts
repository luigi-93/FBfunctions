import express from 'express';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import { IRouteRegistrar } from '../utility/utilityKeys';
import { CustomLogger } from '../logging/customLogger';
export declare class RouteRegistrar implements IRouteRegistrar {
    private logger;
    constructor(logger: CustomLogger);
    register(app: express.Express, strategyFactory: AuthStrategyFactory): void;
}
