import express from 'express';
import { ServerInitializer } from './server/serverInitializer';
import { CustomLogger } from './logging/customLogger';
import { ApiApp } from './routes/index';
export declare class App {
    private readonly logger;
    private readonly serverInitializer;
    private readonly apiApp;
    constructor(logger: CustomLogger, serverInitializer: ServerInitializer, apiApp: ApiApp);
    private cleanup;
    initialize(): Promise<express.Express>;
}
declare function createApp(): Promise<express.Express>;
export { createApp as app };
