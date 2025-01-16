"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioc_1 = require("../ioc");
const dotenv_1 = __importDefault(require("dotenv"));
const firebaseType_1 = require("../utility/firebaseType");
dotenv_1.default.config();
async function testContainer() {
    try {
        const container = await (0, ioc_1.initializeContainer)();
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