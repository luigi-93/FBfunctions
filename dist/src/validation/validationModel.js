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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelManager = void 0;
const class_validator_1 = require("class-validator");
const loggerType_1 = require("../utility/loggerType");
const class_transformer_1 = require("class-transformer");
const errorType_1 = require("../utility/errorType");
const inversify_1 = require("inversify");
let ModelManager = class ModelManager {
    constructor(logger) {
        this.logger = logger;
    }
    _validateOptions(customOptions) {
        return {
            validationError: {
                target: false,
                value: false
            },
            stopAtFirstError: false,
            ...customOptions,
        };
    }
    async validate(model, options, groups) {
        const validationOptions = { ...this._validateOptions(), ...options, groups };
        const errors = await (0, class_validator_1.validate)(model, validationOptions);
        if (errors.length > 0) {
            const formattedErrors = this._formatValidationErrors(errors);
            this.logger.error('Model validation failed', 'ModelManager', { model, formattedErrors });
            throw new errorType_1.CustomError('Validation failed', 400, { fieldErrors: formattedErrors });
        }
    }
    _formatValidationErrors(errors) {
        const formattedErrors = {};
        errors.forEach(error => {
            const property = error.property;
            if (!formattedErrors[property]) {
                formattedErrors[property] = [];
            }
            if (error.constraints) {
                formattedErrors[property].push(...Object.values(error.constraints));
            }
        });
        return formattedErrors;
    }
    async toClass(cls, data, toValidate = true) {
        if (data === null) {
            throw new errorType_1.CustomError('Invalid or empty data privided', 400);
        }
        const isArray = Array.isArray(data);
        const normalizedData = isArray
            ? data.filter(item => item != null && typeof item === 'object')
            : data;
        if ((isArray && normalizedData.length === 0) || (!isArray && Object.keys(normalizedData).length === 0)) {
            throw new errorType_1.CustomError(isArray
                ? 'Array is empty'
                : 'Object is empty', 400);
        }
        const instances = (0, class_transformer_1.plainToClass)(cls, data, {
            enableImplicitConversion: true
        });
        if (toValidate) {
            const validationMethod = isArray
                ? Promise.all(instances.map(instance => this.validate(instance)))
                : this.validate(instances);
            await validationMethod;
        }
        return instances;
    }
    async toPlain(model, toValidate = true) {
        if (toValidate) {
            await this.validate(model);
        }
        return JSON.parse(JSON.stringify(model));
    }
};
exports.ModelManager = ModelManager;
exports.ModelManager = ModelManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(loggerType_1.CustomLogger)),
    __metadata("design:paramtypes", [loggerType_1.CustomLogger])
], ModelManager);
//# sourceMappingURL=validationModel.js.map