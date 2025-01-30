"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const firebaseType_1 = require("../utility/firebaseType");
const customLogger_1 = require("../logging/customLogger");
const containerInit_1 = require("../ioc/containerInit");
dotenv_1.default.config();
async function testContainer() {
    const loggertest = new customLogger_1.CustomLogger({ logLevel: 'debug' });
    try {
        loggertest.debug('Starting container test');
        const container = await (0, containerInit_1.initializeContainer)();
        loggertest.debug('Container initialized', 'testContainer');
        const logger = container.get(firebaseType_1.SYMBOLS.CUSTOM_LOGGER);
        console.log('Successfully resolved logger');
        const dependecies = [
            { name: 'Server', symbol: firebaseType_1.SYMBOLS.SERVER },
            { name: 'ApiApp', symbol: firebaseType_1.SYMBOLS.API_APP },
        ];
        for (const dep of dependecies) {
            try {
                if (!container.isBound(dep.symbol)) {
                    console.error(`No binding found for ${dep.name}`);
                    continue;
                }
                const resolved = container.get(dep.symbol);
                console.log(`Successfully resolved ${dep.name}`, typeof resolved);
            }
            catch (error) {
                console.error(`Failed to resolve ${dep.name}:`, error);
            }
        }
        if (!container.isBound(firebaseType_1.SYMBOLS.APP)) {
            throw new Error('App binding not found in the container');
        }
        const app = container.get(firebaseType_1.SYMBOLS.APP);
        console.log('Successfully resolved app');
    }
    catch (error) {
        console.error('Contanier test failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
        }
        process.exit(1);
    }
}
(async () => {
    try {
        await testContainer();
    }
    catch (error) {
        console.error('Test execution failed:', error);
    }
})();
//# sourceMappingURL=container-test.js.map