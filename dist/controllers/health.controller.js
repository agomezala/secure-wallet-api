"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = getHealth;
const database_1 = require("../config/database");
const logger_1 = __importDefault(require("../middlewares/logger"));
async function getHealth(_req, res) {
    const isDbHealthy = await (0, database_1.healthCheck)();
    if (!isDbHealthy) {
        logger_1.default.error('Health check failed — database unreachable');
        res.status(503).json({
            status: 'DOWN',
            timestamp: new Date().toISOString(),
        });
        return;
    }
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=health.controller.js.map