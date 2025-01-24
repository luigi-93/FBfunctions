import { initializeContainer } from "../ioc";
import dotenv from 'dotenv';
import { SYMBOLS } from "../utility/firebaseType";
import { CustomLogger } from "../logging/customLogger";


dotenv.config();

async function testContainer() {
    const loggertest = new CustomLogger({ logLevel: 'debug'})
    try {
        loggertest.debug('Starting container test')
        const container = await initializeContainer();

        loggertest.debug(
            'Container initialized', 
            'testContainer')
        
        const logger = container.get<CustomLogger>(SYMBOLS.CUSTOM_LOGGER);
        console.log('Successfully resolved logger')

       

        const dependecies = [
            { name: 'Server', symbol: SYMBOLS.SERVER},
            { name: 'ApiApp', symbol: SYMBOLS.API_APP},
            //{ name: 'ApiKeyManager', symbol: SYMBOLS.API_KEY_MANAGER}          
        ];

        for (const dep of dependecies) {
            try {
                if (!container.isBound(dep.symbol)) {
                    console.error(`No binding found for ${dep.name}`);
                    continue;
                }
                const resolved = container.get(dep.symbol);
                console.log(`Successfully resolved ${dep.name}`, typeof resolved)
            } catch (error) {
                console.error(`Failed to resolve ${dep.name}:`, error)
            }
        }

    if(!container.isBound(SYMBOLS.APP)) {
        throw new Error('App binding not found in the container')
    }

    const app = container.get(SYMBOLS.APP);
    console.log ('Successfully resolved app')


    } catch (error) {
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
    } catch (error) {
        console.error('Test execution failed:', error)
    }
})();
