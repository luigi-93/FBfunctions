"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const inversify_1 = require("inversify");
const http_1 = __importDefault(require("http"));
const customLogger_1 = require("../logging/customLogger");
const firebaseType_1 = require("../utility/firebaseType");
let Server = class Server {
    constructor(logger) {
        this.logger = logger;
        this.httpServer = null;
    }
    build(app, pathPrefix, apiApp) {
        app.use(pathPrefix, apiApp.build());
        this.logger.info(`API mounted at ${pathPrefix}`, 'Server');
        return this;
    }
    setupProcessErrorHandler(cleanup) {
        process.on('uncaoughtException', (error) => {
            this.logger.error('Uncaught Exeption', 'Process', {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack
            });
            this.gracefulShutdown(cleanup);
        });
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled Rejection', 'Process', {
                reason: reason instanceof Error
                    ? reason.message
                    : JSON.stringify(reason)
            });
            this.gracefulShutdown(cleanup);
        });
        ['SIGTEM', 'SIGINT'].forEach(signal => {
            process.on(signal, () => {
                this.logger.warn(`Received ${signal}, initiating graceful shutdown`, 'Process');
                this.gracefulShutdown(cleanup);
            });
        });
        return this;
    }
    start(app, port) {
        return new Promise((resolve, reject) => {
            try {
                const server = http_1.default.createServer(app);
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
            }
            catch (error) {
                this.logger.error('Failed to start server', 'Server', {
                    errorMessage: error instanceof Error
                        ? error.message
                        : String(error)
                });
                reject(error);
            }
        });
    }
    gracefulShutdown(cleanup) {
        this.logger.warn('Initiating graceful shutdown', 'Server');
        if (cleanup) {
            try {
                cleanup();
            }
            catch (cleanupError) {
                this.logger.error('Error during cleanup', 'Server', {
                    errorMessage: cleanupError instanceof Error
                        ? cleanupError.message
                        : String(cleanupError)
                });
            }
        }
        if (this.httpServer) {
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
        }
        else {
            process.exit(1);
        }
    }
};
exports.Server = Server;
exports.Server = Server = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(firebaseType_1.SYMBOLS.CUSTOM_LOGGER)),
    __metadata("design:paramtypes", [customLogger_1.CustomLogger])
], Server);
//# sourceMappingURL=server.js.map