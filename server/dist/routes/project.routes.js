"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const project_controller_1 = require("../controllers/project.controller");
const router = (0, express_1.Router)();
// Все маршруты защищены авторизацией
router.use(auth_middleware_1.protect);
router.get('/', project_controller_1.getProjects);
router.post('/', project_controller_1.createProject);
router.get('/:id', project_controller_1.getProjectById);
router.put('/:id', project_controller_1.updateProject);
router.delete('/:id', project_controller_1.deleteProject);
exports.default = router;
