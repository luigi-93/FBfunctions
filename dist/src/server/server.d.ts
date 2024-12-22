import { Express } from 'express';
import http from 'http';
import { CustomLogger } from "../utility/loggerType";
import { ApiApp } from "../routes";
export declare class Server {
    private logger;
    private httpServer?;
    constructor(logger: CustomLogger);
    build(app: Express, pathPrefix: string, apiApp: ApiApp): this;
    setupProcessErrorHandler(cleanup?: () => void): this;
    start(app: Express, port: number): Promise<http.Server>;
    gracefulShutdown(cleanup?: () => void): void;
}
