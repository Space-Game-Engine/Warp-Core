import {PrismaClient} from "@prisma/client";
import {EventListener} from "./EventListener";

export interface ApolloContext {
    prisma: PrismaClient;
    listeners: Array<EventListener>;
}
