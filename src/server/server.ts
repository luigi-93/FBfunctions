import { inject, injectable } from "inversify";
import { Express } from 'express';
import http from 'http';
import { CustomLogger } from "../utility/loggerType";
import { ApiApp } from "../routes";


@injectable()
export class Server {
    private httpServer?: http.Server | null = null;

    constructor(
        @inject(CustomLogger) private logger: CustomLogger
    ) {}


    /**
     * Buils and mounts the API application at a specifies path prefix
     * @param app the main Express application
     * @param pathPrefix the URL path prefic for the API
     * @param apiApp the API application to mount
     * @returns this server instance for a method chaining
     */

    public build(app: Express, pathPrefix: string, apiApp: ApiApp): this {
        app.use(pathPrefix, apiApp.build());
        this.logger.info(`API mounted at ${pathPrefix}`, 'Server');
        return this;
    }
        
    /**
     * Sets up comprehensive process-level error handlers
     * @param cleanup Optional cleanup fnction to run before process termination
     */   

    public setupProcessErrorHandler(cleanup?: () => void): this {
        process.on('uncaoughtException', (error: Error) => {
            this.logger.error('Uncaught Exeption', 'Process', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack
            });

            this.gracefulShutdown(cleanup);
        });

        process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
            this.logger.error('Unhandled Rejection', 'Process', {
                reason: reason instanceof Error 
                ? reason.message 
                : JSON.stringify(reason)
            });

            this.gracefulShutdown(cleanup);
        });

        // Additional process signals for graceful shutdown
        ['SIGTEM', 'SIGINT'].forEach(signal => {
            process.on(signal, () => {
                this.logger.warn(`Received ${signal}, initiating graceful shutdown`, 'Process');
                this.gracefulShutdown(cleanup);
            });
        });

        return this;
    }

    /**
     * Strats the HTTP server
     * @param app the Express application to serve
     * @param port the port to listen on
     * @returns A promise that resolves when the server is listening
     */

    public start(app: Express, port: number): Promise<http.Server> {
        return new Promise((resolve, reject) => {
            try {

                const server = http.createServer(app)

                this.httpServer = server;

                this.httpServer.listen(port, () => {
                    this.logger.info(`Server running on port ${port}`, 'Server');
                    resolve(server);             
                });

                this.httpServer.on('error', (error) => {
                    this.logger.error('Server startup', 'Server', {
                        errorMessage: error.message,
                        errorName: error.name
                    });

                    reject(error);
                });
            } catch (error) {
                this.logger.error('Failed to start server', 'Server', {
                    errorMessage: error instanceof Error 
                    ? error.message 
                    : String(error)
                });


                reject(error);
            }
        });
    }

    /**
     * Performs a graceful shutdown of the server
     * @param cleanup Optional cleanup function to run
     */

    gracefulShutdown(cleanup?: () => void): void {
        this.logger.warn('Initiating graceful shutdown', 'Server');



        // Run otional cleanup
        if (cleanup) {
            try {
                cleanup();
            } catch (cleanupError) {
                this.logger.error('Error during cleanup', 'Server', {
                    errorMessage: cleanupError instanceof Error
                    ? cleanupError.message
                    : String(cleanupError)
                });
            }
        }

        if(this.httpServer) {
            this.httpServer.close((err) => {
                if (err) {
                    this.logger.error('Error closing server', 'Server', {
                        errorMessage: err.message
                    });
                }

                setTimeout(() => {
                    this.logger.warn('Forcefully down', 'Server');
                    process.exit(1);
                }, 5000);
            });
        } else {
            process.exit(1);
        }


    }

    
}