import { Container } from "inversify";
import { CustomLogger } from "../logging/customLogger";
import { container, setupIoC } from "./index";
import { CustomError } from "../errors/customError";

export async function initializeContainer(): Promise<Container> {
    const tempLogger = new CustomLogger({ logLevel:'debug'});
    try {
        tempLogger.debug(
            'Initializing container',
            'IoC-Init',
            {
                containerExists: !!container,
                containerType: typeof container
            }
        )
      
        const initializedContainer  = await setupIoC(container);
        if (!initializedContainer) {
            throw CustomError.create(
                'setupIoc returned undefined or null container',
                500,
                {
                    error: 'Container initialization failed'
                });
        }
        return initializedContainer;
    } catch (setupError) {
        tempLogger.error(
            'Container initialization failed',
            'IoC-Init',
            {
                error: setupError instanceof Error
                ? {
                    name: setupError.name,
                    message: setupError.message,
                    stack: setupError.stack
                }
                : 'Uknown error'
            }
        )
        throw CustomError.create(
            'InintilizeContainer does not return',
            401,
            {
                error: setupError,
                phase: 'Container initilization'
            });
    }
}