import { Express, Response } from 'express';
import { CustomLogger } from "../logging/customLogger";
export declare abstract class ServerConfig {
    protected readonly logger: CustomLogger;
    protected readonly app: Express;
    constructor(logger: CustomLogger);
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
