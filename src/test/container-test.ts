import { container, initializeContainer } from "../ioc";
import { SYMBOLS } from "../utility/firebaseType";
import { CustomLogger } from "../utility/loggerType";


async function testContainer() {
    try {

        initializeContainer();
        
        const logger = container.get<CustomLogger>(SYMBOLS.CUSTOM_LOGGER);
        console.log('Successfully resolved logger')

       

        const dependecies = [
            { name: 'Server', symbol: SYMBOLS.SERVER},
            { name: 'ApiApp', symbol: SYMBOLS.API_APP},
            //{ name: 'ApiKeyManager', symbol: SYMBOLS.API_KEY_MANAGER}          
        ];

        for (const dep of dependecies) {
            try {
                const resolved = container.get(dep.symbol);
                console.log(`Successfully resolved ${dep.name}`, typeof resolved)
            } catch (error) {
                console.error(`Failed to resolve ${dep.name}:`, error)
            }
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
    }
    
}

testContainer().catch(console.error)