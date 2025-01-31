import { ApiApp } from "../routes";
import { CustomLogger } from "../logging/customLogger";
import { Server } from "./server";
import { ApiKeyManager } from '../services/apiKeyManager';
import express from 'express';
import { SecurityScopes, SYMBOLS } from '../utility/utilityKeys';
import { inject, injectable } from "inversify";
import { AuthStrategyFactory } from "../strategies/strategyHelpers";
import { RouteRegistrar } from "../routes/register-routes";



@injectable()
export class ServerInitializer {

    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private readonly logger: CustomLogger,
        @inject(SYMBOLS.SERVER) private readonly server: Server,
        @inject(SYMBOLS.API_APP) private readonly apiApp: ApiApp,
        @inject(SYMBOLS.API_KEY_MANAGER) private readonly apiKeyManager: ApiKeyManager,
        @inject(SYMBOLS.AUTH_STRATEGY_FACTORY) private strategyFactory: AuthStrategyFactory,
        @inject(SYMBOLS.ROUTE_REGISTRAR) private routeRegistrar: RouteRegistrar
    ) {}

    async initialize (
        app: express.Express,
        port: number,
        cleanup?: () => void
    ) {
        try {

            this.routeRegistrar.register(app, this.strategyFactory)

            await this.server
            .build(app, '/api', this.apiApp)
            .setupProcessErrorHandler(cleanup);
        
            this.registerDefaultApiKey();

            this.logger.info('Server initialized successfully')

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

    async start(app: express.Express, port: number): Promise<void> {
        return new Promise((resolve) => {
            app.listen(port, () => {
                this.logger.info(
                    `Server started on port ${port}`);
                resolve();
            });
        });
    }

    private registerDefaultApiKey() {
        this.apiKeyManager.create( 'default-service-key', {
            scopes: [SecurityScopes.User],
            expiresAt: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        });
    }
}