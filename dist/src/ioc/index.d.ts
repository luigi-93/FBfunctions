import { Container } from "inversify";
import { ContainerAdapter } from "./iocConfig";
export declare const container: Container;
export declare const iocContainer: ContainerAdapter;
export declare function initializeContainer(): Promise<Container>;
