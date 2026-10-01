import { Router } from "express";
import { loginController, registerController } from "../controllers/authController.js";

const router = Router();

//* Ruta publica para registrarse: POST /api/auth/register
router.post('/register', registerController);

//* Ruta pública de login: POST /api/auth/login

router.post('/login', loginController);

export default router;