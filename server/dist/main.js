"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test
require("reflect-metadata");
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const request_id_middleware_1 = require("./common/middleware/request-id.middleware");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(new request_id_middleware_1.RequestIdMiddleware().use);
    app.setGlobalPrefix('api');
    // Support comma-separated list of allowed origins so both the Cloudflare
    // Pages URL and any custom domain work without code changes.
    // e.g. FRONTEND_URL=https://evmglobal.pages.dev,https://www.evmglobal.com
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
        .split(',')
        .map(o => o.trim())
        .filter(Boolean);
    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (server-to-server, curl, Postman)
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin))
                return callback(null, true);
            callback(new Error(`CORS: origin '${origin}' not allowed`));
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true,
    });
    // Cloud Run requires listening on 0.0.0.0 and reads PORT from env (default 8080)
    const port = process.env.PORT || 8080;
    await app.listen(port, '0.0.0.0');
    common_1.Logger.log(`🚀 Server running on port ${port}`, 'Bootstrap');
}
bootstrap().catch(err => {
    console.error('Fatal startup error:', err.message);
    process.exit(1);
});
