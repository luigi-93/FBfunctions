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
exports.RootController = void 0;
const inversify_1 = require("inversify");
const utilityKeys_1 = require("../../utility/utilityKeys");
const tsoa_1 = require("tsoa");
const customLogger_1 = require("../../logging/customLogger");
let RootController = class RootController extends tsoa_1.Controller {
    constructor(logger) {
        super();
        this.logger = logger;
        logger.debug('RootController initialized', 'RootController');
    }
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
    (0, utilityKeys_1.provideSingleton)(RootController),
    (0, tsoa_1.Route)("/"),
    __param(0, (0, inversify_1.inject)(utilityKeys_1.SYMBOLS.CUSTOM_LOGGER)),
    __metadata("design:paramtypes", [customLogger_1.CustomLogger])
], RootController);
//# sourceMappingURL=rootController.js.map