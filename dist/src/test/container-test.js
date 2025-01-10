"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioc_1 = require("../ioc");
const firebaseType_1 = require("../utility/firebaseType");
async function testContainer() {
    try {
        const logger = ioc_1.container.get(firebaseType_1.SYMBOLS.CUSTOM_LOGGER);
        console.log('Successfu.ly resolved logger');
        const app = ioc_1.container.get(firebaseType_1.SYMBOLS.APP);
        console.log('Successfully resolved app');
        const dependecies = [
            { name: 'Server', symbol: firebaseType_1.SYMBOLS.SERVER },
            { name: 'ApiApp', symbol: firebaseType_1.SYMBOLS.API_APP },
            { name: 'ApiKeyManager', symbol: firebaseType_1.SYMBOLS.API_KEY_MANAGER },
            { name: 'ServerInitializer', symbol: firebaseType_1.SYMBOLS.SERVER_INITIALIZER }
        ];
        for (const dep of dependecies) {
            try {
                ioc_1.container.get(dep.symbol);
                console.log(`Successfully resolved ${dep.name}`);
            }
            catch (error) {
                console.error(`Failed to resolve ${dep.name}:`, error);
            }
        }
    }
    catch (error) {
        console.error('Contanier test failed:', error);
    }
}
testContainer().catch(console.error);
//# sourceMappingURL=container-test.js.map