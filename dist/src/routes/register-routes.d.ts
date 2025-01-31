import express from 'express';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import { IRouteRegistrar } from '../utility/utilityKeys';
export declare class RouteRegistrar implements IRouteRegistrar {
    register(app: express.Express, strategyFactory: AuthStrategyFactory): void;
}
