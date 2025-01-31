import { ServerConfig } from "../config/servConfig";
import { CustomLogger } from "../logging/customLogger";
import { AuthStrategyFactory } from "../strategies/strategyHelpers";
import { RouteRegistrar } from "./register-routes";
export declare class ApiApp extends ServerConfig {
    private strategyFactory;
    private routeRegistrar;
    constructor(logger: CustomLogger, strategyFactory: AuthStrategyFactory, routeRegistrar: RouteRegistrar);
    protected setRoutes(): void;
    protected setErrorHandler(): void;
}
