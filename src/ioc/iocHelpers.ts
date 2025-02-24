import { Container, injectable, interfaces } from "inversify";
import { CustomError } from "../errors/customError";
import { IocContainer } from "@tsoa/runtime";

@injectable()
export class ContainerAdapter implements IocContainer {
    constructor(private readonly container: Container) {
        if (!container) {
            throw CustomError.create(
                'Container instance is required',
                500,
                {
                    details: 'Container was not provided to ContainerAdapter'
                }
            );
        }
    }
    
    get<T>(controller: interfaces.ServiceIdentifier<T> | { prototype: T }): T 
    {
        try {
            if (!controller) {
                throw CustomError.create(
                    'Controller parameter is requireds',
                    500,
                    {
                        message: 'Constroller was not provided'
                    });
            }
            if (typeof controller === 'symbol' || 
                typeof controller === 'string' || 
                typeof controller === 'function') {
                return this.container.get<T>(controller);
            }
            if (typeof controller === 'object' && 'prototype' in controller) {
                const serviceIdentifier = controller.constructor as interfaces.ServiceIdentifier<T>;
            
                if (!serviceIdentifier) {
                    throw CustomError.create(
                        'Invalid controller constructor',
                        500,
                        {
                            message: 'Provide the right controller constructor'
                        });
                }
                return this.container.get<T>(serviceIdentifier)
            }
            throw CustomError.create(
                'Unsupported controller type',
                500,
                {
                    message: 'The type of controller is not supported'
                }
            ) 
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorDetails = {
                controller: this.getControllerIdentifier(controller),
                originalError: errorMessage
            };
            throw CustomError.create(
                'Dependency resolution failed',
                500,
                errorDetails
            );
        }
    }

    private getControllerIdentifier(controller: any): string {
        if (typeof controller === 'symbol') {
            return controller.toString()
        }
        if (typeof controller === 'function') {
            return controller.name || 'Anonymous Function';
        }
        if (controller?.constructor) {
            return controller.constructor.name || 'Unknown Class';
        }
        return 'Unknow Controller Type'
    }
}


