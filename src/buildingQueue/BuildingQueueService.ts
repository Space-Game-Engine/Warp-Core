import {Inject} from "typedi";
import {PrismaClient} from "@prisma/client";

export class BuildingQueueService {
    constructor(
        @Inject("PRISMA") private readonly prisma: PrismaClient
    ) {
    }

}
