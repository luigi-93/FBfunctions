import { ApiKeyMetadata, CustomClaims, DecodedFirebaseToken, FirebaseAuthProvider, SecurityScopes } from "./firebaseType";
export declare class ApikeyTokenGenerator {
    private static logger;
    static generateMockToken(apikey: string, metadata?: Partial<ApiKeyMetadata>): DecodedFirebaseToken;
    static createApiKeyManager(): {
        create(name: string, options?: {
            scopes?: SecurityScopes[];
            provider?: FirebaseAuthProvider;
            expiresAt?: number;
            additionalClaims?: CustomClaims;
        }): {
            apiKey: string;
            metadata: ApiKeyMetadata;
        };
        get(apiKey: string): ApiKeyMetadata | undefined;
        revoke(apiKey: string): void;
    };
}
export declare const ApiKeyManager: {
    create(name: string, options?: {
        scopes?: SecurityScopes[];
        provider?: FirebaseAuthProvider;
        expiresAt?: number;
        additionalClaims?: CustomClaims;
    }): {
        apiKey: string;
        metadata: ApiKeyMetadata;
    };
    get(apiKey: string): ApiKeyMetadata | undefined;
    revoke(apiKey: string): void;
};
