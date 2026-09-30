//* Configuracion middleware de seguridad y autenticacion

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import authRoutes from '/.routes./authRoutes.js'


//* Cargar las variables de entorno del .env
dotenv.config();

const app = express();

//* Configuracion de limitador de peticiones 

const lmt = rateLimit({
    windowMs: 15 * 60 * 1000, //? ventana de tiempo de 15 minutos
    max: 100, //? limite de peticiones por IP
    message: {
        status: 'ERROR',
        message: "Demasiadas peticiones dedes esta IP, por favor intente más tarde."
    },
     standardHeaders: true, //? Devuelve informacion de limite en los headers rate-limit
    legacyHeaders: false, //? Desactiva los headers X-RateLimit-* (deprecated)
})


//*  middleware globales

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(lmt);
app.use('/api/auth',authRoutes);


//* Ruta de prueba para verificar que el servidor responde

app.get('/api/health',(req, res) =>{
    res.json({status: 'SANO', message: 'Servidor corriendo correctamente'})
});

//* Ruta de prueba protegida con middleware de autenticacion
app.get('/api/profile', authMiddleware,(req, res) =>{
    res.json({
        stuts: 'EXITO',
        message: 'Bienvenido a tu perfil',
        userL: req.user
    })
})
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en el pueto ${PORT}`)
});

export default app;