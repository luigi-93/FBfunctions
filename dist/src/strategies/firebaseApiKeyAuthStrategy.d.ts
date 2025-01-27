import { ApiKeyManager } from "../services/apiKeyManager";
import { BaseAuthStrategy } from "./strategyHelpers";
import { CustomLogger } from "../logging/customLogger";
import express from 'express';
import { AuthenticatedUser } from "../auth/userAuth";
export declare class FirebaseApiKeyAuthStrategy extends BaseAuthStrategy {
    private apiKeyManager;
    constructor(apiKeyManager: ApiKeyManager, logger?: CustomLogger);
    authenticate(request: express.Request, securityName: string, scopes?: string[]): Promise<AuthenticatedUser>;
    private extractApiKey;
    private validateApiKey;
    private generateMockToken;
    private maskApiKey;
}
