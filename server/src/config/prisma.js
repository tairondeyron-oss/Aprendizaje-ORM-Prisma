//*  Server/src/config/prisma.js
import { prismaClient } from "@prisma/client";

//* Instancia Prisma Client para interactuar con la base de datos

const prisma = new prismaClient();

export default prisma;