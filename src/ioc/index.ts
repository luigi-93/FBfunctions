import { Container, decorate, injectable } from "inversify";
import { CustomLogger } from "../logging/customLogger";
import { CustomError } from "../errors/customError";
import { Controller } from "tsoa";
import { configBinding } from "../config/iocConfig";
import { buildProviderModule } from "inversify-binding-decorators";
import { IoCSetup } from "./bindAuth";
import { ContainerAdapter } from "./iocHelpers";

export const container = new Container({ defaultScope: 'Singleton' });
export const iocContainer = new ContainerAdapter(container);
decorate(injectable(), Controller);

export async function initializeContainer(): Promise<Container> {
    const logger = new CustomLogger({ logLevel:'debug'});
    logger.debug(
        'Starting container setup with container instance',
        'IoC-Init',
    )
    try {
        configBinding(container)

        logger.debug('Starting IoC container setup', 'IoC-Setup');
        //Setup basic IoC first
        const result = await IoCSetup(
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
            'IoC-Setup', 
            { result });
        
        return container;
      
    } catch (setupError) {
        logger.error(
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