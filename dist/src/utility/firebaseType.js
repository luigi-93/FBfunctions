"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_CONTEXT_KEY = exports.requiredBindngs = exports.SYMBOLS = exports.StrategyRegistry = exports.registry = exports.SecurityScopes = exports.SecurityNameTypes = exports.FirebaseAuthProvider = void 0;
exports.provideSingleton = provideSingleton;
const inversify_binding_decorators_1 = require("inversify-binding-decorators");
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
    FirebaseApiKeyAuthStrategy: Symbol.for('FirebaseApiKeyAuthStrategy')
};
exports.StrategyRegistry = {
    FirebaseJwtAuthStrategy: exports.registry.FirebaseJwtAuthStrategy,
    ApiKeyStrategy: exports.registry.FirebaseApiKeyAuthStrategy,
};
exports.SYMBOLS = {
    AUTH_STRATEGY_FACTORY: Symbol.for('AuthStrategyFactory'),
    CUSTOM_LOGGER: Symbol.for('CustomLogger'),
    API_KEY_MANAGER: Symbol.for('ApiKeyManager'),
    SERVER: Symbol.for('Server'),
    API_APP: Symbol.for('ApiApp'),
    APP: Symbol.for('App'),
    STORAGE_ADAPTER: Symbol.for('StorageAdapter'),
    API_KEY_VALIDATOR: Symbol.for('ApiKeyValidator'),
    SERVER_CONFIG: Symbol.for('ServerConfig'),
    CONTAINER_ADAPTER: Symbol.for('ContainerAdapter'),
    SERVER_INITIALIZER: Symbol.for('ServerInitializer')
};
exports.requiredBindngs = [
    { symbol: exports.SYMBOLS.CUSTOM_LOGGER, name: 'CustomLogger' },
    { symbol: exports.SYMBOLS.APP, name: 'App' }
];
function provideSingleton(indentifier) {
    return (0, inversify_binding_decorators_1.fluentProvide)(indentifier).inSingletonScope().done();
}
exports.AUTH_CONTEXT_KEY = 'tsoa-auth-context';
//# sourceMappingURL=firebaseType.js.map