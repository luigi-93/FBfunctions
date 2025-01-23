import { inject, injectable } from "inversify";
import { CustomLogger } from "../utility/loggerType";
import express, 
    { Express, 
    Request, 
    Response, 
    NextFunction }  from 'express';
import { CustomError } from "../utility/errorType";
import { SYMBOLS } from "../utility/firebaseType";

/**
 * This class is base framework for setting up an express application.
 * It defines a template for initializing and configure the server.
 */

@injectable()
export abstract class ServerConfig {
    protected readonly app: Express;

    constructor(
        @inject(SYMBOLS.CUSTOM_LOGGER) protected readonly logger: CustomLogger
    ) {
        this.app = express();
        this.initialized();  
    }

    private initialized(): void {
        this.setTrustProxy();
        this.setMiddlewares();
        this.setBodyParser();
        this.setBasicSecurity();
        this.setLogger();
        this.setRoutes();
        this.setErrorHandler();
    }

    public build(): Express {
        return this.app;
    }

    protected abstract setRoutes(): void;



    protected setBasicSecurity(): void {

    /**
     * 1. It prevents potential attackers from easily identifying the exact technology stack of your application
     * 2. It reduces information leakage that could be useful for crafting targeted attacks
     * 3. It makes it slightly more difficult for malicious actors to exploit known vulnerabilities specific to a particular framework or version
     */
        this.app.disable('x-powered-by');
        //here you can add more middlware helpfull based on your scope
    }

    protected setLogger(): void {
        this.app.use((req: Request, _res: Response, next: NextFunction) => {
            this.logger.info(`${req.method} ${req.path}`);  
            
            next();
        });
    }

    protected setGeneralErrorHandler(err: Error, res: Response): void {
        this.logger.error(JSON.stringify({
            message: err.message,
            name: err.name,
            stack: err.stack
        }), 'error-handler');

        //check if it's a customError with specific payload
        if ( err instanceof CustomError) {
            //User the status from customErro or defaoult to 500
            const statusCode = err.statusCode || 500;

            //Prepare error response
            const errorResponse: {
                message: string;
                fieldErrors?: any;
            } = {
                message: err.message
            };

            //add Field errors if they exist
            if (err.payload?.fieldErrors) {
                errorResponse.fieldErrors = err.payload.fieldErrors;
            }
            //Send the response
            res.status(statusCode).json(errorResponse)


        } else {
            //if the error can not be customed 
            res.status(500).json({
                message: 'Internal Server Error'
            });
        }
       
    }

    //Delegates actual error formatting to setGeneralErrorHandler.
    protected setErrorHandler(): void {
        this.app.use(
            (err: Error,
                req: Request,
                res: Response,
                _next: NextFunction,
            ) => {
                this.setGeneralErrorHandler(err, res);
            }
        );
    }

    protected setTrustProxy(): void {
        this.app.set('trust proxy', true);
    }

    protected setMiddlewares(): void {
        this.app.use(express.json());
    }

    protected setBodyParser(): void {
        this.app.use(express.urlencoded({ extended: true }));
    }

}