"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const config_1 = require("../config");
const logger = (0, pino_1.default)({
    level: config_1.config.isProduction ? 'info' : 'debug',
    transport: config_1.config.isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: { colorize: true },
        },
    formatters: {
        level(label) {
            return { level: label };
        },
    },
    serializers: {
        req: pino_1.default.stdSerializers.req,
        res: pino_1.default.stdSerializers.res,
        err: pino_1.default.stdSerializers.err,
    },
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie'],
        censor: '[REDACTED]',
    },
});
exports.default = logger;
//# sourceMappingURL=logger.js.map