import { 
    Container, 
    decorate, 
    inject, 
    injectable } from "inversify";
import { Controller } from "tsoa";
import { ContainerAdapter, IoCSetup } from "./iocConfig";
import { ApiApp } from "../routes";
import { buildProviderModule } from "inversify-binding-decorators";
import { ModelManager } from "../validation/validationModel";




const container = new Container();

decorate(injectable(), Controller);

function setupIoC() {
    try {
        IoCSetup(container)
        container.bind(ApiApp).toSelf();
        container.bind(ModelManager).toSelf();
    } catch (error) {
        console.error("Error setting up IoC container:", error)
    }
}


export function loadProviderModule() {
    setupIoC();

    container.load(buildProviderModule());
}


export const iocContainer = new ContainerAdapter(container);