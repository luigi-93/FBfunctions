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
exports.RootController = void 0;
const firebaseType_1 = require("../../utility/firebaseType");
const tsoa_1 = require("tsoa");
let RootController = class RootController extends tsoa_1.Controller {
    async getRoot() {
        return { message: "Hello, World!" };
    }
};
exports.RootController = RootController;
__decorate([
    (0, tsoa_1.Get)("/"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RootController.prototype, "getRoot", null);
exports.RootController = RootController = __decorate([
    (0, firebaseType_1.provideSingleton)(RootController),
    (0, tsoa_1.Route)("/")
], RootController);
//# sourceMappingURL=rootController.js.map