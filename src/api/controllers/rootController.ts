import { inject } from "inversify";
import { provideSingleton, SYMBOLS } from "../../utility/utilityKeys";
import { Controller, Get, Route } from "tsoa";
import { CustomLogger } from "../../logging/customLogger";


@provideSingleton(RootController)
@Route("/")
export class RootController extends Controller {
    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) private logger: CustomLogger
    ) {
        super();
        logger.debug('RootController initialized', 'RootController')
    }

    @Get("/")
    public async getRoot(): Promise<{ message: string }> {
        return { message: "Hello, World!" };
    }
}