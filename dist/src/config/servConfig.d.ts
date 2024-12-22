import { CustomLogger } from "../utility/loggerType";
import { Express, Response } from 'express';
export declare abstract class ServerConfig {
    protected readonly app: Express;
    protected logger: CustomLogger;
    constructor(logger?: CustomLogger);
    private initialized;
    build(): Express;
    protected abstract setRoutes(): void;
    protected setBasicSecurity(): void;
    protected setLogger(): void;
    protected setGeneralErrorHandler(err: Error, res: Response): void;
    protected setErrorHandler(): void;
    protected setTrustProxy(): void;
    protected setMiddlewares(): void;
    protected setBodyParser(): void;
}
