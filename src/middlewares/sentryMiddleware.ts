import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';

export const initializeSentry = (dsn: string): void => {
    Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'development',
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }) // Corrected integration
        ],
        tracesSampleRate: 1.0,
    });
};

export const sentryMiddleware = (req: Request, res: Response, next: NextFunction) => 
    Sentry.Handlers.requestHandler()(req, res, next);

export const sentryErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => 
    Sentry.Handlers.errorHandler()(err, req, res, next);