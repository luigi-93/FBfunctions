import { BaseAuthStrategy } from "./strategyHelpers";
import * as admin from 'firebase-admin';
import { CustomLogger } from "../logging/customLogger";
import express from 'express';
import { AuthenticatedUser } from "../auth/userAuth";
export declare class FirebaseJwtAuthStrategy extends BaseAuthStrategy {
    private firebaseAdmin;
    constructor(firebaseAdmin: typeof admin, logger?: CustomLogger);
    authenticate(request: express.Request, securityName: string, scopes?: string[]): Promise<AuthenticatedUser>;
    private extraBearerToken;
    private validateSecurityName;
    private verifyFirebaseToken;
    private handleAuthenticationError;
    refreshToken(token: string): Promise<string>;
}
