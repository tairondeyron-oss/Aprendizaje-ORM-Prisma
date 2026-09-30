import { registerUserService, loginUserService } from "../services/authService";

//* Controlador para manejar la peticion HTTP de registro

export const registerController = async (req, res) => {
    try {
        const { phone, password, name, role } = req.body;

        const newUser = await registerUserService({ phone, password, name, role });

        return res.status(201).json({
            status: 'EXITO',
            message: 'Usuario registrado correctamente.',
            data: newUser,
        });
    } catch (error) {
        return res.status(400).json({
            status: 'ERROR',
            message: error.message,
        });
    }
};


//* conrolador para peticion http del login 

export const loginController = async (req, res) => {

    try {
        const { phone, password, name, role } = req.body
    const result = await loginUserService({ phone, password});

    return res.status(200).json({
        status: 'EXITO',
        message: 'Inicio de sisión exitoso',
        data: result,
    });
    } catch (error) {
        const statusCode = error.message.includes('bloqueada') ? 423 : 401;

        return res.status(statusCode).json({
            status: 'ERROR',
            message: error.message,
        });
    } 
};

