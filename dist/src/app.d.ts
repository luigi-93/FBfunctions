import express from 'express';
import { Server } from './server/server';
import { ApiApp } from './routes';
import { ApiKeyManager } from './services/apiKeyManager';
import { CustomLogger } from './utility/loggerType';
export declare class App {
    private readonly logger;
    private readonly server;
    private readonly apiApp;
    private readonly apikeyManager;
    constructor(logger: CustomLogger, server: Server, apiApp: ApiApp, apikeyManager: ApiKeyManager);
    initialize(): Promise<express.Express>;
}
export declare function createApp(): Promise<express.Express>;
export declare const app: Promise<express.Express>;
