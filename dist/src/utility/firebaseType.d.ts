import express from 'express';
import { AuthenticatedUser } from '../auth/userAuth';
export declare enum FirebaseAuthProvider {
    EMAIL_PASSWORD = "email_pass",
    GOOGLE = "Google",
    FACEBOOK = "Facebook",
    TWITTER = "Twitter",
    GITHUB = "GitHub",
    ANONYMOUS = "Anony"
}
export interface IAuthStrategy {
    authenticate(request: express.Request, securityName: string, scopes?: string[]): Promise<AuthenticatedUser>;
}
export interface AuthConfig {
    provider: FirebaseAuthProvider;
    options?: {
        scope?: string[];
        customParameters?: Record<string, string>;
        [key: string]: any;
    };
}
export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId: string;
    measurementId?: string;
}
export interface ServiceConfig {
    firebaseConfig: FirebaseConfig;
    serviceAccountPath?: string;
}
export interface IJson {
    [key: string]: any;
}
export declare enum SecurityNameTypes {
    JWT = "jwt"
}
export declare enum SecurityScopes {
    Admin = "admn",
    User = "usr",
    SuperAdmin = "supr_admn"
}
export declare const registry: {
    FirebaseAdmin: symbol;
    FirebaseJwtAuthStrategy: symbol;
    ApiKeyAuthStrategy: symbol;
};
export interface CustomClaims {
    acl?: SecurityScopes[];
    [key: string]: any;
}
export interface DecodedFirebaseToken {
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    sub: string;
    uid: string;
    acl: SecurityScopes[];
    name: string;
    email: string;
    auth_time: number;
    firebase: {
        identities: Record<string, any>;
        sign_in_provider: string;
        token_type: string;
        api_key_id?: string;
    };
    [key: string]: any;
}
export declare const StrategyRegistry: {
    readonly FirebaseJwtAuthStrategy: symbol;
    readonly ApiKeyStrategy: symbol;
};
export type StrategyName = keyof typeof StrategyRegistry;
export interface ApiKeyMetadata {
    id: string;
    name: string;
    description?: string;
    scopes: SecurityScopes[];
    provider?: FirebaseAuthProvider;
    createdAt: number;
    expirestAt?: number;
    lastUsed?: number;
    usageCount?: number;
    additionalClaims?: CustomClaims;
    status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}
export interface ApiKeyStorageAdapter {
    save(apiKey: string, metadata: ApiKeyMetadata): Promise<void>;
    get(apiKey: string): Promise<ApiKeyMetadata | undefined>;
    revoke(apiKey: string): Promise<void>;
    listAll(): Promise<Record<string, ApiKeyMetadata>>;
    prune(): Promise<void>;
}
export interface ValidationResult {
    isValid: boolean;
    missingFields: string[];
    config: FirebaseConfig | null;
}
