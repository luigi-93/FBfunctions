"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiV2 = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("./app");
let expressApp = null;
async function getApp() {
    if (!expressApp) {
        expressApp = await (0, app_1.app)();
    }
    return expressApp;
}
exports.apiV2 = (0, https_1.onRequest)({
    region: 'us-central1'
}, async (req, res) => {
    const app = await getApp();
    app(req, res);
});
//# sourceMappingURL=firebase.js.map