//*  Server/src/config/prisma.js
import { PrismaClient } from "@prisma/client";

//* Instancia Prisma Client para interactuar con la base de datos

const prisma = new PrismaClient();

export default prisma;