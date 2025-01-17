"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
async function startLocalServer() {
    const expressApp = await (0, app_1.app)();
    const PORT = Number(process.env.PORT || 3000);
    expressApp.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
startLocalServer();
//# sourceMappingURL=local.js.map