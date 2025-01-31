import express from 'express';
import { AuthenticatedUser } from '../auth/userAuth';
import { ApiKeyManager } from '../services/apiKeyManager';
import { interfaces } from 'inversify';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';
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
    FirebaseApiKeyAuthStrategy: symbol;
};
export declare const StrategyRegistry: {
    readonly FirebaseJwtAuthStrategy: symbol;
    readonly ApiKeyStrategy: symbol;
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
export interface ApiKeyResult {
    name: string;
    key: string;
    scopes: SecurityScopes[];
    expiresAt?: number;
}
export interface IoCSetupResult {
    apiKeyManager: ApiKeyManager;
    generatedKeys: ApiKeyResult[];
}
export type StrategyName = keyof typeof StrategyRegistry;
export interface ApiKeyMetadata {
    id: string;
    name: string;
    description?: string;
    scopes: SecurityScopes[];
    provider?: FirebaseAuthProvider;
    createdAt: number;
    expiresAt?: number;
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
export declare const SYMBOLS: {
    CONTAINER: symbol;
    AUTH_STRATEGY_FACTORY: symbol;
    CUSTOM_LOGGER: symbol;
    API_KEY_MANAGER: symbol;
    SERVER: symbol;
    API_APP: symbol;
    APP: symbol;
    STORAGE_ADAPTER: symbol;
    API_KEY_VALIDATOR: symbol;
    SERVER_CONFIG: symbol;
    CONTAINER_ADAPTER: symbol;
    SERVER_INITIALIZER: symbol;
    ROUTE_REGISTRAR: symbol;
};
export declare const requiredBindngs: readonly [{
    readonly symbol: symbol;
    readonly name: "CustomLogger";
}, {
    readonly symbol: symbol;
    readonly name: "App";
}];
export declare function provideSingleton<T>(indentifier: interfaces.ServiceIdentifier<T>): (target: any) => any;
export declare const AUTH_CONTEXT_KEY = "tsoa-auth-context";
export type AuthContext = {
    strategyFactory: AuthStrategyFactory;
};
export interface IRouteRegistrar {
    register(app: express.Express, strategyFactory: AuthStrategyFactory): void;
}
