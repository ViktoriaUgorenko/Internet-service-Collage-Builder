"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
// Логирование всех входящих запросов
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// API Маршруты
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.get('/api/health', async (req, res, next) => {
    try {
        // Простой запрос к БД для проверки соединения
        await prisma.$queryRaw `SELECT 1`;
        res.status(200).json({ status: 'ok', db: 'connected', version: '1.0' });
    }
    catch (error) {
        console.error('Database connection failed', error);
        // Передаем ошибку в глобальный обработчик
        next(error);
    }
});
// Базовый глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error('\x1b[31m[Global Error Handler]\x1b[0m', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
