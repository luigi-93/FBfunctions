import { Container } from "inversify";
import { ContainerAdapter } from "./iocHelpers";
export declare const container: Container;
export declare const iocContainer: ContainerAdapter;
export declare function initializeContainer(): Promise<Container>;
