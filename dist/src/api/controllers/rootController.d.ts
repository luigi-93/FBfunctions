import { Controller } from "tsoa";
import { CustomLogger } from "../../logging/customLogger";
export declare class RootController extends Controller {
    private logger;
    constructor(logger: CustomLogger);
    getRoot(): Promise<{
        message: string;
    }>;
}
