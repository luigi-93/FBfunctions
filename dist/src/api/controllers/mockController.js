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
exports.MockController = void 0;
const tsoa_1 = require("tsoa");
const firebaseType_1 = require("../../utility/firebaseType");
let MockController = class MockController extends tsoa_1.Controller {
    async getMockData() {
        return { status: "public ok" };
    }
    async getSecuredJwt() {
        return { status: "jwt secured ok" };
    }
    async getSecurityApiKeyData() {
        return { status: "api key secured ok" };
    }
};
exports.MockController = MockController;
__decorate([
    (0, tsoa_1.Get)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MockController.prototype, "getMockData", null);
__decorate([
    (0, tsoa_1.Get)("/secured/jwt"),
    (0, tsoa_1.Security)("jwt", [firebaseType_1.SecurityScopes.Admin]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MockController.prototype, "getSecuredJwt", null);
__decorate([
    (0, tsoa_1.Get)("/security/api-key"),
    (0, tsoa_1.Security)("apiKey"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MockController.prototype, "getSecurityApiKeyData", null);
exports.MockController = MockController = __decorate([
    (0, tsoa_1.Route)("mock")
], MockController);
//# sourceMappingURL=mockController.js.map