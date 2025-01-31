import { ApiKeyMetadata, ApiKeyStorageAdapter, CustomClaims, DecodedFirebaseToken, FirebaseAuthProvider, SecurityScopes } from "../utility/utilityKeys";
import { CustomLogger } from '../logging/customLogger';
import { ApiKeyValidator } from "../validation/validationApiKey";
export declare class ApiKeyManager {
    private logger;
    private storageAdapter;
    private validator;
    private keyRotationInterval;
    constructor(logger: CustomLogger, storageAdapter: ApiKeyStorageAdapter, validator: ApiKeyValidator);
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
