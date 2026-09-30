import jwt from 'jsonwebtoken';


export const authMiddleware = async ( req, res, next) => {
    //* obtener el token del header 'Authorization'
    const authHeader = req.header.authorization;

    //* tokens enviador como 'Bearer xxx validar si empieza asi 

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({
            status: 'ERROR',
            message: 'Acceso denegado, el token es invalido.'
        });
    }

    //* Separar el texto 'Bearer' del token real 
    const token = authHeader.split(' ')[1];

    try {
        //* Validar que el token usado sea la clave secreta del archivo .env
        //* se usa process.env.JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //* Inyeccion de los datos descifrados del usuario en la peticion
        req.user = decoded;

        //* Acceso a la siguiete funcion o ruta en caso de token válido

        next();
    } catch (error) {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Acceso denegado el token es invalido o ha expirado, intente nuevamente.'
        });
    }
};