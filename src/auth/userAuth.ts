import { Request } from 'express';
import { 
    DecodedFirebaseToken, 
    SecurityScopes } 
    from "../utility/utilityKeys";
import { CustomLogger } from '../logging/customLogger';
import { CustomError } from '../errors/customError';


export class AuthenticatedUser {
    private readonly _rawDecodedToken: DecodedFirebaseToken;
    private logger: CustomLogger

    constructor(decodedToken: DecodedFirebaseToken, logger?: CustomLogger) {
        if (decodedToken.firebase?.sign_in_provider === "anonymous") {
            throw CustomError.create(
                'Anonymous authentication is not allowed', 
                401,
                { signInProvider: "anonymous"},
                "AUTH001");
        }
        this._rawDecodedToken = decodedToken;
        this.logger = logger || CustomLogger.create();
        this.logger.info("AuthenticatedUser Initialized", "auth", { uid: decodedToken.uid });
    }

    private _hasOneOfAcl(requiredScopes: SecurityScopes[]): SecurityScopes | undefined {
        return requiredScopes.find(scope => this._rawDecodedToken.acl?.includes(scope));
    }

    get isAdmin(): boolean {
        return this._hasOneOfAcl([SecurityScopes.Admin]) !== undefined;
    }

    getCustomClaim(claimName: string): string | undefined {
        return this._rawDecodedToken[claimName];
    }

    private _validateCustomId(
        request: Request,
        options: {
            paramName: string,
            claimName: string,
            requiredScope: SecurityScopes,
            optional?: boolean
        }
    ): boolean {
        const { paramName, claimName, requiredScope, optional = false} = options;
        const paramId = request.params?.[paramName] || request.query?.[paramName];

        if (optional && !paramId) return true;

        const tokenId = this._rawDecodedToken[claimName];
        const hasScope = this._hasOneOfAcl([requiredScope])

        if(!paramId || tokenId !== paramId || !hasScope ) {
            throw CustomError.create(
                `Invalid ${paramName} or insufficient permissions `,
                403,
                { paramName, claimName, requiredScope},
                "AUTH003");
        }
        return true;
    }

    isAllowedTo(
        request: Request, 
        options?: {
            requiredScopes?: SecurityScopes[];
            custommValidations?: Array<(user: AuthenticatedUser, request: Request) => boolean>;
        }
        ): boolean {

            try {
                if(options?.requiredScopes && !this._hasOneOfAcl(options.requiredScopes)) {
                    throw CustomError.create(
                        `Forbidden: Required scopes ${options.requiredScopes.join(',')} not met`,
                        403,
                        { requiredScopes: options.requiredScopes },
                        "AUTH002"
                    );
                }
                if(this.isAdmin) return true;
                if(options?.custommValidations) {  
                        options.custommValidations.forEach(validation => {
                            if(!validation(this, request)){
                             throw CustomError.create(
                                 'Custom validation failed',
                                 404,
                                 { validation },
                                 "AUTH002");
                            }
                        });
                    } 
            } catch (error) {
                if (error instanceof Error) {
                    this.logger.error(error.message, "auth", { error });
                    throw error;
                } else {
                    const unknowError = new CustomError("Anknown error occcured", 500, { error })
                    this.logger.error(unknowError.message, "auth", { error: unknowError})
                    throw error
                }
            }
            return true;
        
    }
}