import { ServerConfig } from "../config/servConfig";
import { CustomLogger } from "../logging/customLogger";
import { AuthStrategyFactory } from "../strategies/strategyHelpers";
export declare class ApiApp extends ServerConfig {
    private strategyFactory;
    constructor(logger: CustomLogger, strategyFactory: AuthStrategyFactory);
    protected setRoutes(): void;
    protected setErrorHandler(): void;
}
