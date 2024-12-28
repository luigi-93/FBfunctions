import { ApiApp } from "../routes";
import { CustomLogger } from "../utility/loggerType";
import { Server } from "./server";
import { ApiKeyManager } from '../services/apiKeyManager';
import express from 'express';
export declare class ServerInitializer {
    private logger;
    private server;
    private apiApp;
    private apiKeyManager;
    constructor(logger: CustomLogger, server: Server, apiApp: ApiApp, apiKeyManager: ApiKeyManager);
    initialize(app: express.Express, port: number, cleanup?: () => void): Promise<express.Express>;
    private registerDefaultApiKey;
}
