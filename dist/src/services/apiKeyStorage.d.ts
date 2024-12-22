import { ApiKeyMetadata, ApiKeyStorageAdapter } from "../utility/firebaseType";
import { CustomLogger } from "../utility/loggerType";
export declare class InMemoryStorageAdapter implements ApiKeyStorageAdapter {
    private apiKeys;
    private logger;
    constructor(logger?: CustomLogger);
    save(apiKey: string, metadata: ApiKeyMetadata): Promise<void>;
    get(apiKey: string): Promise<ApiKeyMetadata | undefined>;
    revoke(apiKey: string): Promise<void>;
    listAll(): Promise<Record<string, ApiKeyMetadata>>;
    prune(): Promise<void>;
}
