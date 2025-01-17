"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiV2 = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("./app");
exports.apiV2 = (0, https_1.onRequest)({
    region: 'us-central1'
}, async (req, res) => {
    const expressApp = await (0, app_1.app)();
    expressApp(req, res);
});
//# sourceMappingURL=firebase.js.map