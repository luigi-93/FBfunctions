import express from 'express';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';
import { expressAuthentication } from '../api/tsoaAuth';
import { AuthContext, AUTH_CONTEXT_KEY } from '../utility/firebaseType';
import { RegisterRoutes } from 'api/routes';


export function resisterRoutesWithAuth(
    app: express.Express, 
    strategyFactory: AuthStrategyFactory)
    {
        // Store context in app locals
        const ctx: AuthContext = { strategyFactory};
        app.locals[AUTH_CONTEXT_KEY] = ctx;

        // Configure authentication handler
        const originalAuth = (global as any).expressAuthentication;

        (global as any).expressAuthentication = (
            request: express.Request,
            securityName: string,
            scopes: string[]
        ) => {
            const ctx = app.locals[AUTH_CONTEXT_KEY] as AuthContext;
            return expressAuthentication(
                request, 
                securityName, 
                scopes, 
                ctx.strategyFactory
            );
        }; 

        try {
            RegisterRoutes(app);
        } finally {
            (global as any).expressAuthentication = originalAuth;
        }
    }


    