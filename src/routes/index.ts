import { inject, injectable } from "inversify";
import { ServerConfig } from "../config/servConfig";
import express, 
        { Response } 
        from 'express';
import { setErrorHandler } from "../errors/apiHandlerError";
import { CustomLogger } from "../logging/customLogger";
import { SYMBOLS } from '../utility/utilityKeys';
import { AuthStrategyFactory } from "../strategies/strategyHelpers";
import { RouteRegistrar } from "./register-routes";

@injectable()
export class ApiApp extends ServerConfig {
    private routeRegistrar: RouteRegistrar;

    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) logger: CustomLogger,
        @inject(SYMBOLS.AUTH_STRATEGY_FACTORY) private strategyFactory: AuthStrategyFactory,
        @inject(SYMBOLS.ROUTE_REGISTRAR) routeRegistrar: RouteRegistrar
    ) {
        super(logger);
        logger.debug('Route injected:', 'Apiapp', routeRegistrar)
        this.routeRegistrar = routeRegistrar;
        this.initialized()
    }
    protected setRoutes() {
        this.routeRegistrar.register(this.app, this.strategyFactory)
    }

    protected setErrorHandler() {
        this.app.use(
            (
                err: Error,
                req: express.Request,
                res: Response,
                _next: express.NextFunction,
            ) => {
                //adding a logging to show up the err could be a god idea??
                setErrorHandler(err, res, this.setGeneralErrorHandler.bind(this));
            }
        );
    }
}