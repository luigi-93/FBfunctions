import { AuthenticatedUser } from '../auth/userAuth';
import express from 'express';
export declare function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<AuthenticatedUser>;
