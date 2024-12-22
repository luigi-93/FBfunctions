import { ApiKeyMetadata, ApiKeyStorageAdapter, CustomClaims, DecodedFirebaseToken, FirebaseAuthProvider, SecurityScopes } from "../utility/firebaseType";
import { CustomLogger } from '../utility/loggerType';
export declare class ApikeyManager {
    private storageAdapter;
    private validator;
    private logger;
    private keyRotationInterval;
    constructor(storageAdapter?: ApiKeyStorageAdapter, logger?: CustomLogger);
    create(name: string, options?: {
        scopes?: SecurityScopes[];
        provider?: FirebaseAuthProvider;
        expiresAt?: number;
        additionalClaims?: CustomClaims;
    }): Promise<{
        apiKey: string;
        metadata: ApiKeyMetadata;
    }>;
    get(apiKey: string): Promise<ApiKeyMetadata | undefined>;
    revoke(apiKey: string): Promise<void>;
    rotateKey(existingApiKey: string, options?: {
        revokeOld?: boolean;
        transferScopes?: boolean;
    }): Promise<{
        newApiKey: string;
        metadata: ApiKeyMetadata;
    }>;
    pruneExpiredKeys(): Promise<void>;
    generateMockToken(apiKey: string, metadata: ApiKeyMetadata): DecodedFirebaseToken;
    private generateSecureApiKey;
}
export declare const ApiKeyManagerInstance: ApikeyManager;
