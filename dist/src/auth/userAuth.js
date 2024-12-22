"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticatedUser = void 0;
const errorType_1 = require("../utility/errorType");
const firebaseType_1 = require("../utility/firebaseType");
const loggerType_1 = require("../utility/loggerType");
class AuthenticatedUser {
    constructor(decodedToken, logger) {
        if (decodedToken.firebase?.sign_in_provider === "anonymous") {
            throw errorType_1.CustomError.create('Anonymous authentication is not allowed', 401, { signInProvider: "anonymous" }, "AUTH001");
        }
        this._rawDecodedToken = decodedToken;
        this.logger = logger || loggerType_1.CustomLogger.create();
        this.logger.info("AuthenticatedUser Initialized", "auth", { uid: decodedToken.uid });
    }
    _hasOneOfAcl(requiredScopes) {
        return requiredScopes.find(scope => this._rawDecodedToken.acl?.includes(scope));
    }
    get isAdmin() {
        return this._hasOneOfAcl([firebaseType_1.SecurityScopes.Admin]) !== undefined;
    }
    getCustomClaim(claimName) {
        return this._rawDecodedToken[claimName];
    }
    _validateCustomId(request, options) {
        const { paramName, claimName, requiredScope, optional = false } = options;
        const paramId = request.params?.[paramName] || request.query?.[paramName];
        if (optional && !paramId)
            return true;
        const tokenId = this._rawDecodedToken[claimName];
        const hasScope = this._hasOneOfAcl([requiredScope]);
        if (!paramId || tokenId !== paramId || !hasScope) {
            throw errorType_1.CustomError.create(`Invalid ${paramName} or insufficient permissions `, 403, { paramName, claimName, requiredScope }, "AUTH003");
        }
        return true;
    }
    isAllowedTo(request, options) {
        try {
            if (options?.requiredScopes && !this._hasOneOfAcl(options.requiredScopes)) {
                throw errorType_1.CustomError.create(`Forbidden: Required scopes ${options.requiredScopes.join(',')} not met`, 403, { requiredScopes: options.requiredScopes }, "AUTH002");
            }
            if (this.isAdmin)
                return true;
            if (options?.custommValidations) {
                options.custommValidations.forEach(validation => {
                    if (!validation(this, request)) {
                        throw errorType_1.CustomError.create('Custom validation failed', 404, { validation }, "AUTH002");
                    }
                });
            }
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(error.message, "auth", { error });
                throw error;
            }
            else {
                const unknowError = new errorType_1.CustomError("Anknown error occcured", 500, { error });
                this.logger.error(unknowError.message, "auth", { error: unknowError });
                throw error;
            }
        }
        return true;
    }
}
exports.AuthenticatedUser = AuthenticatedUser;
//# sourceMappingURL=userAuth.js.map