import { Container } from 'inversify';
import { IoCSetupResult, SecurityScopes } from '../utility/utilityKeys';
import { CustomLogger } from '../logging/customLogger';
export declare function ioCSetup(iocContainer: Container, options: {
    apiKeys?: Array<{
        name: string;
        scopes?: SecurityScopes[];
        expiresAt?: number;
    }>;
    needAdminPrivileges?: boolean;
} | undefined, logger: CustomLogger): Promise<IoCSetupResult>;
