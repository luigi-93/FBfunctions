import express from 'express';
import { ApiApp } from './routes';
import { ServerInitializer } from './server/serverInitializer';
import { CustomLogger } from './logging/customLogger';
export declare class App {
    private readonly logger;
    private readonly apiApp;
    private readonly serverInitializer;
    constructor(logger: CustomLogger, apiApp: ApiApp, serverInitializer: ServerInitializer);
    private cleanup;
    initialize(): Promise<express.Express>;
}
declare function createApp(): Promise<express.Express>;
export { createApp as app };
