import { ServerConfig } from "../config/servConfig";
import { CustomLogger } from "../logging/customLogger";
export declare class ApiApp extends ServerConfig {
    constructor(logger: CustomLogger);
    protected setRoutes(): void;
    protected setErrorHandler(): void;
}
