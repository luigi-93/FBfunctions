import { ApiKeyMetadata, ApiKeyStorageAdapter } from "../utility/utilityKeys";
import { CustomLogger } from "../logging/customLogger";
export declare class InMemoryStorageAdapter implements ApiKeyStorageAdapter {
    private readonly logger;
    private apiKeys;
    constructor(logger: CustomLogger);
    save(apiKey: string, metadata: ApiKeyMetadata): Promise<void>;
    get(apiKey: string): Promise<ApiKeyMetadata | undefined>;
    revoke(apiKey: string): Promise<void>;
    listAll(): Promise<Record<string, ApiKeyMetadata>>;
    prune(): Promise<void>;
}
