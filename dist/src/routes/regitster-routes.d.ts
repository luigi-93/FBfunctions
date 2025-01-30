import express from 'express';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';
export declare function resisterRoutesWithAuth(app: express.Express, strategyFactory: AuthStrategyFactory): void;
