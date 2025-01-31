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
exports.ServerConfig = void 0;
const inversify_1 = require("inversify");
const express_1 = __importDefault(require("express"));
const customError_1 = require("../errors/customError");
const utilityKeys_1 = require("../utility/utilityKeys");
const customLogger_1 = require("../logging/customLogger");
let ServerConfig = class ServerConfig {
    constructor(logger) {
        this.logger = logger;
        this.app = (0, express_1.default)();
        this.initialized();
    }
    initialized() {
        this.setTrustProxy();
        this.setMiddlewares();
        this.setBodyParser();
        this.setBasicSecurity();
        this.setLogger();
        this.setRoutes();
        this.setErrorHandler();
    }
    build() {
        return this.app;
    }
    setBasicSecurity() {
        this.app.disable('x-powered-by');
    }
    setLogger() {
        this.app.use((req, _res, next) => {
            this.logger.info(`${req.method} ${req.path}`);
            next();
        });
    }
    setGeneralErrorHandler(err, res) {
        this.logger.error(JSON.stringify({
            message: err.message,
            name: err.name,
            stack: err.stack
        }), 'error-handler');
        if (err instanceof customError_1.CustomError) {
            const statusCode = err.statusCode || 500;
            const errorResponse = {
                message: err.message
            };
            if (err.payload?.fieldErrors) {
                errorResponse.fieldErrors = err.payload.fieldErrors;
            }
            res.status(statusCode).json(errorResponse);
        }
        else {
            res.status(500).json({
                message: 'Internal Server Error'
            });
        }
    }
    setErrorHandler() {
        this.app.use((err, req, res, _next) => {
            this.setGeneralErrorHandler(err, res);
        });
    }
    setTrustProxy() {
        this.app.set('trust proxy', true);
    }
    setMiddlewares() {
        this.app.use(express_1.default.json());
    }
    setBodyParser() {
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
};
exports.ServerConfig = ServerConfig;
exports.ServerConfig = ServerConfig = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.CUSTOM_LOGGER)),
    __metadata("design:paramtypes", [customLogger_1.CustomLogger])
], ServerConfig);
//# sourceMappingURL=servConfig.js.map