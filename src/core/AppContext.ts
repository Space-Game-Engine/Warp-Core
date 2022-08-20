import {PrismaClient} from "@prisma/client";
import { ContainerType } from "type-graphql";
import {EventListener} from "./EventListener";

export interface AppContext {
    prisma: PrismaClient;
    listeners: Array<EventListener>;
    container: ContainerType;
}
