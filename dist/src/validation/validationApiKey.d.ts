import { ApiKeyMetadata } from "../utility/firebaseType";
import { CustomLogger } from "../utility/loggerType";
export declare class ApiKeyValidator {
    private readonly logger;
    constructor(logger: CustomLogger);
    validate(metadata: ApiKeyMetadata): boolean;
    private checkExpiration;
    private checkScopes;
    private checkUsagePatterns;
    calculateSecurityLevel(metadata: ApiKeyMetadata): 'LOW' | 'MEDIUM' | 'HIGH';
}
