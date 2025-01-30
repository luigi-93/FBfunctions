"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resisterRoutesWithAuth = resisterRoutesWithAuth;
const tsoaAuth_1 = require("../api/tsoaAuth");
const firebaseType_1 = require("../utility/firebaseType");
const routes_1 = require("api/routes");
function resisterRoutesWithAuth(app, strategyFactory) {
    const ctx = { strategyFactory };
    app.locals[firebaseType_1.AUTH_CONTEXT_KEY] = ctx;
    const originalAuth = global.expressAuthentication;
    global.expressAuthentication = (request, securityName, scopes) => {
        const ctx = app.locals[firebaseType_1.AUTH_CONTEXT_KEY];
        return (0, tsoaAuth_1.expressAuthentication)(request, securityName, scopes, ctx.strategyFactory);
    };
    try {
        (0, routes_1.RegisterRoutes)(app);
    }
    finally {
        global.expressAuthentication = originalAuth;
    }
}
//# sourceMappingURL=regitster-routes.js.map