import { 
    Container, 
    decorate, 
    inject, 
    injectable } from "inversify";
import { Controller } from "tsoa";
import { IoCSetup } from "./iocConfig";
import { ApiApp } from "../routes";
import { buildProviderModule } from "inversify-binding-decorators";
import { ModelManager } from "../validation/validationModel";




const iocContainer = new Container();

decorate(injectable(), Controller);

function setupIoC() {
    try {
        IoCSetup(iocContainer)
        iocContainer.bind(ApiApp).toSelf();
        iocContainer.bind(ModelManager).toSelf();
    } catch (error) {
        console.error("Error setting up IoC container:", error)
    }
}


export function loadProviderModule() {
    setupIoC();

    iocContainer.load(buildProviderModule());
}


export {iocContainer, inject}