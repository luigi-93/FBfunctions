import express from 'express';
import { AuthenticatedUser } from '../auth/userAuth';
import { ApiKeyManager } from '../services/apiKeyManager';
import { interfaces } from 'inversify';
import { fluentProvide } from 'inversify-binding-decorators';
import { AuthStrategyFactory } from '../strategies/strategyHelpers';



export enum FirebaseAuthProvider {
    EMAIL_PASSWORD = 'email_pass',
    GOOGLE = 'Google',
    FACEBOOK = 'Facebook',
    TWITTER = 'Twitter',
    GITHUB = 'GitHub',
    ANONYMOUS = 'Anony'
}

export interface IAuthStrategy {
    authenticate(
        request: express.Request,
        securityName: string,
        scopes?: string[]
    ): Promise <AuthenticatedUser> ;
}

export interface AuthConfig {
    provider: FirebaseAuthProvider;
    options?: {
        scope?: string [];
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

export interface ServiceConfig{
    firebaseConfig: FirebaseConfig;
    serviceAccountPath?: string;
}

export interface IJson {
    [key: string]: any;
}

export enum SecurityNameTypes {
    JWT = 'jwt',
}

export enum SecurityScopes {
    Admin = "admn",
    User = "usr",
    SuperAdmin = "supr_admn"
}

export const registry = {
    FirebaseAdmin: Symbol.for('FirebaseAdmin'),
    FirebaseJwtAuthStrategy: Symbol.for('FirebaseJwtAuthStrategy'),
    FirebaseApiKeyAuthStrategy: Symbol.for('FirebaseApiKeyAuthStrategy')
}

export const StrategyRegistry = {
    FirebaseJwtAuthStrategy: registry.FirebaseJwtAuthStrategy,
    ApiKeyStrategy: registry.FirebaseApiKeyAuthStrategy,
} as const;


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

//Binding kyes for the container building 

export const SYMBOLS = {
    CONTAINER: Symbol.for('Container'),
    AUTH_STRATEGY_FACTORY: Symbol.for('AuthStrategyFactory'),
    CUSTOM_LOGGER: Symbol.for('CustomLogger'),
    API_KEY_MANAGER: Symbol.for('ApiKeyManager'),
    SERVER: Symbol.for('Server'),
    API_APP: Symbol.for('ApiApp'),
    APP: Symbol.for('App'),
    STORAGE_ADAPTER: Symbol.for('StorageAdapter'),
    API_KEY_VALIDATOR: Symbol.for('ApiKeyValidator'),
    SERVER_CONFIG: Symbol.for('ServerConfig'),
    CONTAINER_ADAPTER: Symbol.for('ContainerAdapter'),
    SERVER_INITIALIZER: Symbol.for('ServerInitializer'),
    ROUTE_REGISTRAR: Symbol.for('RouteRegistrar'),
    }

export const requiredBindngs = [
        { symbol: SYMBOLS.CUSTOM_LOGGER, name: 'CustomLogger'},
        { symbol: SYMBOLS.APP, name: 'App'}
    ] as const;

//it semplify the binding process
export function provideSingleton<T>(
    indentifier: interfaces.ServiceIdentifier<T>
    ) {
    return fluentProvide(indentifier).inSingletonScope().done();
    }


//key for the auth context in the wrapper RegisterRoutes function
export const AUTH_CONTEXT_KEY = 'tsoa-auth-context';

export type AuthContext = {
    strategyFactory: AuthStrategyFactory;
}

export interface IRouteRegistrar {
    register(app: express.Express, strategyFactory: AuthStrategyFactory): void;
}
    