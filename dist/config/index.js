"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: zod_1.z
        .string()
        .default('3000')
        .transform((v) => parseInt(v, 10))
        .pipe(zod_1.z.number().positive().max(65535)),
    DATABASE_URL: zod_1.z.string().url(),
    RATE_LIMIT_WINDOW_MS: zod_1.z
        .string()
        .default('900000')
        .transform((v) => parseInt(v, 10))
        .pipe(zod_1.z.number().positive()),
    RATE_LIMIT_MAX: zod_1.z
        .string()
        .default('100')
        .transform((v) => parseInt(v, 10))
        .pipe(zod_1.z.number().positive()),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid environment variables:', JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
    process.exit(1);
}
exports.config = {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    databaseUrl: parsed.data.DATABASE_URL,
    rateLimit: {
        windowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
        max: parsed.data.RATE_LIMIT_MAX,
    },
    isProduction: parsed.data.NODE_ENV === 'production',
};
//# sourceMappingURL=index.js.map