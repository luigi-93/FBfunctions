import { Container, interfaces } from "inversify";
import { IocContainer } from "@tsoa/runtime";
export declare class ContainerAdapter implements IocContainer {
    private readonly container;
    constructor(container: Container);
    get<T>(controller: interfaces.ServiceIdentifier<T> | {
        prototype: T;
    }): T;
    private getControllerIdentifier;
}
export declare function initializeContainer(): Promise<Container>;
