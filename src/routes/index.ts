import { injectable } from "inversify";
import { ServerConfig } from "../config/servConfig";
import { RegisterRoutes } from "../../build/api/routes";
import express, 
        { Response } 
        from 'express';
import { setErrorHandler } from "../error/apiHandlerError";


@injectable()
export class ApiApp extends ServerConfig {
    protected setRoutes() {
        RegisterRoutes(this.app);
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