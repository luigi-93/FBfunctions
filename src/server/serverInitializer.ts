import { ApiApp } from "../routes";
import { CustomLogger } from "../utility/loggerType";
import { Server } from "./server";
import { ApiKeyManager } from '../services/apiKeyManager';
import express from 'express';
import { SecurityScopes, SYMBOLS } from '../utility/firebaseType';
import { inject, injectable } from "inversify";

@injectable()
export class ServerInitializer {

    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private readonly logger: CustomLogger,
        @inject(SYMBOLS.SERVER) private readonly server: Server,
        @inject(SYMBOLS.API_APP) private readonly apiApp: ApiApp,
        @inject(SYMBOLS.API_KEY_MANAGER) private readonly apiKeyManager: ApiKeyManager
    ) {}

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