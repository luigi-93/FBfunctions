import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import { AuthenticatedUser } from '../auth/userAuth';
import express from 'express';
export declare function expressAuthentication(request: express.Request, securityName: string, scopes?: string[], strategyFactory?: AuthStrategyFactory): Promise<AuthenticatedUser>;
