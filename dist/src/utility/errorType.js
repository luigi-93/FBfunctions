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
var CustomError_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
const inversify_1 = require("inversify");
let CustomError = CustomError_1 = class CustomError extends Error {
    constructor(message, statusCode = 500, payload, code) {
        super(message);
        this.message = message;
        this.name = 'CustomError';
        Object.defineProperty(this, 'name', {
            value: 'CustomError',
            enumerable: false,
            writable: false,
        });
        this.statusCode = statusCode;
        this.payload = payload;
        this.code = code;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CustomError_1);
        }
    }
    static create(message, statusCode = 500, payload, code) {
        return new CustomError_1(message, statusCode, payload, code);
    }
};
exports.CustomError = CustomError;
exports.CustomError = CustomError = CustomError_1 = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [String, Number, Object, String])
], CustomError);
//# sourceMappingURL=errorType.js.map