import { PrismaClient } from "@prisma/client";
import Container from "typedi";
import { ConfigParser } from "./config/ConfigParser";
import CoreEventEmitter from "./CoreEventEmitter";

const configParser = new ConfigParser();

const prisma = new PrismaClient();
Container.set({ id: "PRISMA", factory: () => prisma });
Container.set({ id: "CONFIG", factory: () => configParser.getConfig() });
Container.set({ id: "CORE_EVENT_EMITTER", factory: () => new CoreEventEmitter() });

export default Container;