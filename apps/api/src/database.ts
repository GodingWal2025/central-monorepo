import { PrismaClient } from '@prisma/client';

// Shared database client instance used across all local actions
export const db = new PrismaClient();
