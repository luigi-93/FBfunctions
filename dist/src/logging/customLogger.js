"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CustomLogger_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomLogger = void 0;
const inversify_1 = require("inversify");
const winston_1 = __importStar(require("winston"));
const Sentry = __importStar(require("@sentry/node"));
const loggerUtilits_1 = require("./loggerUtilits");
let CustomLogger = CustomLogger_1 = class CustomLogger {
    constructor(options = {}) {
        this.sentryInitialized = false;
        const { logLevel, additionalTransports = [], sentryDsn, contextId = 'default' } = options;
        this.defaultContext = contextId;
        const environment = process.env.NODE_ENV || 'development';
        const defaultLogLevels = {
            development: 'debug',
            production: 'error',
            test: 'info'
        };
        const effectiveLogLevel = logLevel || defaultLogLevels[environment] || 'info';
        const customFormat = winston_1.format.printf(({ timestamp, level, message, context = this.defaultContext, ...meta }) => {
            const contextString = context ? `[${context}]` : '';
            const sanitizedMeta = (0, loggerUtilits_1.sanitizeMetadata)(meta);
            const metaString = Object.keys(sanitizedMeta).length ? ` - ${JSON.stringify(sanitizedMeta)}` : '';
            return `${timestamp} ${contextString} [${level.toUpperCase()}]: ${message} ${metaString}`;
        });
        this.logger = winston_1.default.createLogger({
            level: effectiveLogLevel,
            format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), customFormat),
            transports: [
                new winston_1.transports.Console({
                    format: winston_1.format.combine(winston_1.format.colorize({ all: true }), customFormat)
                }),
                ...additionalTransports
            ]
        });
        if (sentryDsn) {
            this.initializeSentry(sentryDsn);
        }
    }
    initializeSentry(sentryDsn) {
        if (this.sentryInitialized)
            return;
        try {
            Sentry.init({
                dsn: sentryDsn,
                environment: process.env.NODE_ENV || 'development',
                tracesSampleRate: (0, loggerUtilits_1.getTracesSampleRate)(),
                beforeSend: (event) => {
                    if (event.user) {
                        delete event.user.email;
                        delete event.user.ip_address;
                    }
                    return event;
                }
            });
            this.sentryInitialized = true;
            this.info('Sentry initialized successfully');
        }
        catch (error) {
            this.error('Failed to initialize Sentry', 'Sentry-init', {
                error
            });
        }
    }
    log(level, message, context, metadata = {}) {
        this.logger.log({
            level,
            message,
            context: context || this.defaultContext,
            ...metadata
        });
    }
    info(message, context, metadata = {}) {
        this.log('info', message, context, metadata);
    }
    warn(message, context, metadata = {}) {
        this.log('warn', message, context, metadata);
    }
    error(message, context, metadata = {}) {
        this.log('error', message, context, metadata);
        if (this.sentryInitialized) {
            try {
                const error = new Error(message);
                const sentryResult = Sentry.captureException(error, {
                    tags: {
                        context: context || this.defaultContext,
                        environment: process.env.NODE_ENV
                    },
                    extra: {
                        metadata,
                        timestamp: new Date().toISOString()
                    }
                });
                if (sentryResult) {
                    this.debug('Error reported to Sentry', 'sentry-tracking', {
                        sentryEventId: sentryResult
                    });
                }
            }
            catch (error) {
                this.warn('Failed to capture error in Sentry', 'sentry-error', {
                    originalError: message,
                    error
                });
            }
        }
    }
    debug(message, context, metadata = {}) {
        this.log('debug', message, context, metadata);
    }
    addTransport(transport) {
        this.logger.add(transport);
    }
    static create(options = {}) {
        return new CustomLogger_1(options);
    }
};
exports.CustomLogger = CustomLogger;
exports.CustomLogger = CustomLogger = CustomLogger_1 = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [Object])
], CustomLogger);
//# sourceMappingURL=customLogger.js.map