"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user?.id },
            data: { name },
            select: { id: true, name: true, email: true, role: true, updatedAt: true }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка обновления профиля' });
    }
};
exports.updateProfile = updateProfile;
