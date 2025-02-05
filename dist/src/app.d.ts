import express from 'express';
import { ServerInitializer } from './server/serverInitializer';
import { CustomLogger } from './logging/customLogger';
export declare class App {
    private readonly logger;
    private readonly serverInitializer;
    constructor(logger: CustomLogger, serverInitializer: ServerInitializer);
    private cleanup;
    initialize(): Promise<express.Express>;
}
declare function createApp(): Promise<express.Express>;
export { createApp as app };
