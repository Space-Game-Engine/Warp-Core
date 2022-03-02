import { PrismaClient } from "@prisma/client";

export interface ApolloContext {
    prisma: PrismaClient;
}