"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrategyRegistry = exports.registry = exports.SecurityScopes = exports.SecurityNameTypes = exports.FirebaseAuthProvider = void 0;
var FirebaseAuthProvider;
(function (FirebaseAuthProvider) {
    FirebaseAuthProvider["EMAIL_PASSWORD"] = "email_pass";
    FirebaseAuthProvider["GOOGLE"] = "Google";
    FirebaseAuthProvider["FACEBOOK"] = "Facebook";
    FirebaseAuthProvider["TWITTER"] = "Twitter";
    FirebaseAuthProvider["GITHUB"] = "GitHub";
    FirebaseAuthProvider["ANONYMOUS"] = "Anony";
})(FirebaseAuthProvider || (exports.FirebaseAuthProvider = FirebaseAuthProvider = {}));
var SecurityNameTypes;
(function (SecurityNameTypes) {
    SecurityNameTypes["JWT"] = "jwt";
})(SecurityNameTypes || (exports.SecurityNameTypes = SecurityNameTypes = {}));
var SecurityScopes;
(function (SecurityScopes) {
    SecurityScopes["Admin"] = "admn";
    SecurityScopes["User"] = "usr";
    SecurityScopes["SuperAdmin"] = "supr_admn";
})(SecurityScopes || (exports.SecurityScopes = SecurityScopes = {}));
exports.registry = {
    FirebaseAdmin: Symbol.for('FirebaseAdmin'),
    FirebaseJwtAuthStrategy: Symbol.for('FirebaseJwtAuthStrategy'),
    ApiKeyAuthStrategy: Symbol.for('ApiKeyAuthStrategy'),
};
exports.StrategyRegistry = {
    FirebaseJwtAuthStrategy: exports.registry.FirebaseJwtAuthStrategy,
    ApiKeyStrategy: exports.registry.ApiKeyAuthStrategy,
};
//# sourceMappingURL=firebaseType.js.map