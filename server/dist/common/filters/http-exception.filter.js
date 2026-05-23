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
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    logger = new common_1.Logger('ExceptionFilter');
    constructor() { }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const requestId = request.headers['x-request-id'] || this.generateRequestId();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorResponse = {};
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === 'string'
                    ? exceptionResponse
                    : exceptionResponse.message || message;
            errorResponse = typeof exceptionResponse === 'object' ? exceptionResponse : {};
        }
        else {
            // Non-HttpException (unexpected error) – log full details but return safe message.
            this.logger.error(`[${requestId}] Unhandled exception: ${exception.message}`, exception.stack);
        }
        const errorPayload = {
            statusCode: status,
            message,
            error: common_1.HttpStatus[status] || 'Internal Server Error',
            requestId,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(process.env.NODE_ENV !== 'production' && { details: errorResponse }),
        };
        // Log HttpExceptions as well (but with lower severity)
        if (status >= 500) {
            this.logger.error(`[${requestId}] ${status} ${request.method} ${request.url} - ${message}`);
        }
        else {
            this.logger.warn(`[${requestId}] ${status} ${request.method} ${request.url} - ${message}`);
        }
        response.status(status).json(errorPayload);
    }
    generateRequestId() {
        return `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [])
], HttpExceptionFilter);
