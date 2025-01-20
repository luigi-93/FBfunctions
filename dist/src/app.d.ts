import express from 'express';
import { Server } from './server/server';
import { ApiApp } from './routes';
import { ApiKeyManager } from './services/apiKeyManager';
import { ServerInitializer } from './server/serverInitializer';
import { CustomLogger } from './utility/loggerType';
export declare class App {
    private readonly logger;
    private readonly server;
    private readonly apiApp;
    private readonly apikeyManager;
    private readonly serverInitializer;
    constructor(logger: CustomLogger, server: Server, apiApp: ApiApp, apikeyManager: ApiKeyManager, serverInitializer: ServerInitializer);
    private cleanup;
    initialize(): Promise<express.Express>;
}
declare function createApp(): Promise<express.Express>;
export { createApp as app };
