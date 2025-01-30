import { ApiApp } from "../routes";
import { CustomLogger } from "../logging/customLogger";
import { Server } from "./server";
import { ApiKeyManager } from '../services/apiKeyManager';
import express from 'express';
import { AuthStrategyFactory } from "../strategies/strategyHelpers";
export declare class ServerInitializer {
    private readonly logger;
    private readonly server;
    private readonly apiApp;
    private readonly apiKeyManager;
    private strategyFactory;
    constructor(logger: CustomLogger, server: Server, apiApp: ApiApp, apiKeyManager: ApiKeyManager, strategyFactory: AuthStrategyFactory);
    initialize(app: express.Express, port: number, cleanup?: () => void): Promise<express.Express>;
    start(app: express.Express, port: number): Promise<void>;
    private registerDefaultApiKey;
}
