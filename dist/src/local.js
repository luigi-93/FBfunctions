"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const loggerType_1 = require("./utility/loggerType");
async function startLocalServer() {
    const logger = new loggerType_1.CustomLogger({ logLevel: 'debug' });
    try {
        const expressApp = await (0, app_1.app)();
        const PORT = Number(process.env.PORT || 3000);
        expressApp.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        logger.error('Failed to start server', 'StartLocalServe', {
            ererrorMessage: error instanceof Error
                ? error.message
                : String(error)
        });
        process.exit(1);
    }
}
startLocalServer();
//# sourceMappingURL=local.js.map