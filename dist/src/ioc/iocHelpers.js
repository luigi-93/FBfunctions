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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerAdapter = void 0;
const inversify_1 = require("inversify");
const customError_1 = require("../errors/customError");
let ContainerAdapter = class ContainerAdapter {
    constructor(container) {
        this.container = container;
        if (!container) {
            throw customError_1.CustomError.create('Container instance is required', 500, {
                details: 'Container was not provided to ContainerAdapter'
            });
        }
    }
    get(controller) {
        try {
            if (!controller) {
                throw customError_1.CustomError.create('Controller parameter is requireds', 500, {
                    message: 'Constroller was not provided'
                });
            }
            if (typeof controller === 'symbol' ||
                typeof controller === 'string' ||
                typeof controller === 'function') {
                return this.container.get(controller);
            }
            if (typeof controller === 'object' && 'prototype' in controller) {
                const serviceIdentifier = controller.constructor;
                if (!serviceIdentifier) {
                    throw customError_1.CustomError.create('Invalid controller constructor', 500, {
                        message: 'Provide the right controller constructor'
                    });
                }
                return this.container.get(serviceIdentifier);
            }
            throw customError_1.CustomError.create('Unsupported controller type', 500, {
                message: 'The type of controller is not supported'
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorDetails = {
                controller: this.getControllerIdentifier(controller),
                originalError: errorMessage
            };
            throw customError_1.CustomError.create('Dependency resolution failed', 500, errorDetails);
        }
    }
    getControllerIdentifier(controller) {
        if (typeof controller === 'symbol') {
            return controller.toString();
        }
        if (typeof controller === 'function') {
            return controller.name || 'Anonymous Function';
        }
        if (controller?.constructor) {
            return controller.constructor.name || 'Unknown Class';
        }
        return 'Unknow Controller Type';
    }
};
exports.ContainerAdapter = ContainerAdapter;
exports.ContainerAdapter = ContainerAdapter = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [inversify_1.Container])
], ContainerAdapter);
//# sourceMappingURL=iocHelpers.js.map