import { ApiApp } from "../routes";
import { CustomLogger } from "../utility/loggerType";
import { Server } from "./server";
import { ApiKeyManager } from '../services/apiKeyManager';
import express from 'express';
import { SecurityScopes } from "../utility/firebaseType";
import { injectable } from "inversify";

@injectable()
export class ServerInitializer {
    private logger: CustomLogger;
    private server: Server;
    private apiApp: ApiApp;
    private apiKeyManager: ApiKeyManager;

    constructor(
        logger: CustomLogger,
        server: Server,
        apiApp: ApiApp,
        apiKeyManager: ApiKeyManager
    ) {
        this.logger = logger;
        this.server = server;
        this.apiApp = apiApp;
        this.apiKeyManager = apiKeyManager;
    }

    async initialize (
        app: express.Express,
        port: number,
        cleanup?: () => void
    ) {
        try {
            await this.server
            .build(app, '/api', this.apiApp)
            .setupProcessErrorHandler(cleanup)
            .start(app, port);

            this.logger.info(
                `Server started on port ${port}`);

            this.registerDefaultApiKey();

            return app;
        } catch (error) {
            this.logger.error(
                'Failed to start server',
                'App Initilization',
                { error }
            );
            process.exit(1);
        }
    }

    private registerDefaultApiKey() {
        this.apiKeyManager.create( 'default-service-key', {
            scopes: [SecurityScopes.User],
            expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        });
    }
}