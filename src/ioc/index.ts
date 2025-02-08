import { 
    Container, 
    decorate, 
    injectable
} from "inversify";
import { Controller } from "tsoa";
import { ioCSetup } from "./bindAuth";
import { buildProviderModule } from "inversify-binding-decorators";
import { CustomError } from "../errors/customError";
import { CustomLogger } from '../logging/customLogger';
import { ContainerAdapter } from "./iocHelpers";
import { configBindings } from "../config/iocConfig";

export const container = new Container({ defaultScope: 'Singleton' });
decorate(injectable(), Controller);

export async function initializeContainer(): Promise<Container> {

    const logger = new CustomLogger({ logLevel: 'debug'});
    logger.debug(
        'Starting container setup with container instance',
        'IoC-Init',
    )

    try {
        configBindings(container)
        
        logger.debug('Starting IoC container setup', 'IoC-Setup');
        //Setup basic IoC first
        const result = await ioCSetup(
            container, 
            {
                apiKeys: [],
                needAdminPrivileges: false
            }, 
            logger);

        
        logger.debug('Loading provider module', 'IoC-Setup');
        container.load(buildProviderModule());

        logger.info(
            'IoC container setup completed successfully', 
            'IoC-Init', 
            { result });

        return container;

    } catch (error) {
        logger.error(
            'Failed to setup IoC container',
            'IoC-Setup-Error',
            {
                errorDetails: error instanceof Error
                ? {
                    name: error.name,
                    message: error.message, 
                }
                : 'Unknown error'
            }
        );

        throw CustomError.create(
            'Failed to setup IoC container',
            500,
            { error }
        );
    }
}



