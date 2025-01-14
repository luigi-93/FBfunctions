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
        (0, ioc_1.initializeContainer)();
        const logger = ioc_1.container.get(firebaseType_1.SYMBOLS.CUSTOM_LOGGER);
        console.log('Successfully resolved logger');
        const dependecies = [
            { name: 'Server', symbol: firebaseType_1.SYMBOLS.SERVER },
            { name: 'ApiApp', symbol: firebaseType_1.SYMBOLS.API_APP },
        ];
        for (const dep of dependecies) {
            try {
                const resolved = ioc_1.container.get(dep.symbol);
                console.log(`Successfully resolved ${dep.name}`, typeof resolved);
            }
            catch (error) {
                console.error(`Failed to resolve ${dep.name}:`, error);
            }
        }
        const app = ioc_1.container.get(firebaseType_1.SYMBOLS.APP);
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
testContainer().catch(console.error);
//# sourceMappingURL=container-test.js.map