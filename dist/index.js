"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const security_middleware_1 = require("./middlewares/security.middleware");
const logger_1 = __importDefault(require("./middlewares/logger"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.use(security_middleware_1.securityHeaders);
app.use(security_middleware_1.rateLimiter);
app.use(express_1.default.json({ limit: '10kb' }));
app.use(routes_1.default);
app.listen(config_1.config.port, () => {
    logger_1.default.info({ port: config_1.config.port, env: config_1.config.nodeEnv }, 'Server started');
});
exports.default = app;
//# sourceMappingURL=index.js.map