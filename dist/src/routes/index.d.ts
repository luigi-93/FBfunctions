import { ServerConfig } from "../config/servConfig";
import { CustomLogger } from "../utility/loggerType";
export declare class ApiApp extends ServerConfig {
    constructor(logger: CustomLogger);
    protected setRoutes(): void;
    protected setErrorHandler(): void;
}
