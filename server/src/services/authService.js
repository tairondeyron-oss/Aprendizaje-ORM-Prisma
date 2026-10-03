//* Importanciones de herramientas de autenticacion

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma.js';

//* Servicio para crear un nuevo usuario */

export const registerUserService = async ( { name, phone, password, role, photo, state } ) => {

    //* Filtro de seguridad y limpieza

    const validPayload =({ name, phone, password,role,photo, state } )  => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/;

        
    if(!name ||name.trim() === '' ) throw new Error('Debe ingresar un nombre');
    
    const phoneStr = String(phone).trim();
    if(!phone || phoneStr.length !== 10 || isNaN(phoneStr)) throw new Error('Debe ingresar un numero de 10 digitos')
    
    if(!password  || password.length < 8 || !passwordRegex.test(password)) throw new Error('La contraseña de tener almenos 8 caracteres, entre ellos una mayúscula y un signo');
        
    if(role && !['BARBER_INDEPENDENT', 'BARBER_AFFILATE','BARBER_BOSS', 'ADMIN'].includes(role.toUpperCase())) throw new Error('El rol debe ser 1 de los siguientes: BARBER_INDEPENDENT, BARBER_AFFILATE, BARBER_BOSS, ADMIN');
    
    if(photo && !/^https?:\/\/.+\.(jpg|jpeg|png)$/i.test(photo)) throw new Error('La foto debe ser una URL válida que termine en .jpg, .jpeg, .png ');
    
    if(state !== undefined && typeof state !== 'boolean') throw new Error('El estado debe ser verdadero o falso.');
    return true;
    }


    validPayload({ name, phone, password, role, photo,state});

    const cleanPayload = ({ name, phone, role, photo, state }) => {
        const cleanPhone = phone ? String(phone).trim() : '';
        const cleanName = name ? name.trim() : '';
        const cleanRole = role ? role.trim().toUpperCase() : 'BARBER_INDEPENDENT';
        const cleanPhoto = photo ? photo.trim() : '';
        const cleanState = state !== undefined ? Boolean(state) : true;
        return {
            cleanName,
            cleanPhone,
            cleanRole,
            cleanPhoto,
            cleanState
        };
    };
    

    const { cleanName,cleanPhone,cleanRole,cleanPhoto,cleanState } = cleanPayload({ name, phone, role, photo, state });

    const existingUser = await prisma.user.findUnique({ where: {phone: cleanPhone}});

    if(existingUser){
        throw new Error('El usuario ya esta registrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
        data: {
            phone: cleanPhone,
            password: hashedPassword,
            role: cleanRole || 'BARBER_INDEPENDENT',
            name: cleanName,
            photo: cleanPhoto || '',
            state: cleanState !== undefined ? cleanState : true,
        },
        select: {
            user_id: true,
            phone: true,
            role: true,
            name: true,
            photo: true,
            state: true,
            createdAt: true,
        },
    });
    return newUser;
};


//* Servicio para iniciar sesion de forma segura

export const loginUserService = async ({ phone, password }) => {

    const cleanPhone = phone ? String(phone).trim() : '';

    const user = await prisma.user.findUnique({ where: { phone: cleanPhone}});

    if(!user){
        throw new Error('Credenciales invalidas');
    }

    //* Validar si la cuenta esta bloqueada temporalmente

    if(user.lockUntil && user.lockUntil > new Date()){
        const minutesLeft = Math.ceil((user.lockUntil - new Date()) / 60000);
        throw new Error(`La cuenta esta bloqueada temporalmente. Intente nuevamente en ${minutesLeft} minutos.`);
    }


    //* Comparar la contraseña con la hasheada

    const isPasswordValid = await bcrypt.compare(password, user.password);


    if(!isPasswordValid){
        //* Contador de intentos fallidos de inicio de sesion
        const updatedAttempts = user.failedAttempts + 1;
        let lockoutTime = null;

        //* si alcanza los 5 intentos fallidos se bloquea

        if(updatedAttempts >= 5){
            lockoutTime = new Date(Date.now() + 15 * 60 * 1000);
        }

        await prisma.user.update({
            where: { user_id: user.user_id },
            data: {
                failedAttempts: updatedAttempts,
                lockUntil: lockoutTime,
            },
        });

        throw new Error('Credenciales inválidas.');
    }

    //* Login en caso de exito reinicia conteo

    await prisma.user.update({
        where: { user_id: user.user_id },
        data: {
            failedAttempts: 0,
            lockUntil: null,
        },
    });

    //* Generar token JWT con payload incluyendo el rol

    const token = jwt.sign(
        {
            id: user.user_id,
            phone: user.phone,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h'} //* Token expira en 8 horas por seguridad
    );

    return {
        token,
        user: {
            id: user.user_id,
            name: user.name,
            role: user.role,
            phone: user.phone,
        },
    };
};