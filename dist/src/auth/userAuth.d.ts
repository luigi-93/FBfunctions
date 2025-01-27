import { Request } from 'express';
import { DecodedFirebaseToken, SecurityScopes } from "../utility/firebaseType";
import { CustomLogger } from '../logging/customLogger';
export declare class AuthenticatedUser {
    private readonly _rawDecodedToken;
    private logger;
    constructor(decodedToken: DecodedFirebaseToken, logger?: CustomLogger);
    private _hasOneOfAcl;
    get isAdmin(): boolean;
    getCustomClaim(claimName: string): string | undefined;
    private _validateCustomId;
    isAllowedTo(request: Request, options?: {
        requiredScopes?: SecurityScopes[];
        custommValidations?: Array<(user: AuthenticatedUser, request: Request) => boolean>;
    }): boolean;
}
