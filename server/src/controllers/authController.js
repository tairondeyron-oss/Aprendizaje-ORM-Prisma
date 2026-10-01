import { registerUserService, loginUserService } from "../services/authService.js";

//* Controlador para manejar la peticion HTTP de registro

export const registerController = async (req, res) => {
    try {
        const { phone, password, name, role, photo, state } = req.body;


        if(state !== undefined && typeof state !== 'boolean') {
            return res.status(400).json({
                status: 'ERROR',
                message: 'El estado debe ser verdadero o falso.'
            })
        }

        const newUser = await registerUserService({
            phone,
            password,
            name,
            role,
            photo,
            state
        });

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
        const { phone, password} = req.body
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

