import { ContainerType } from "type-graphql";
import Container from "typedi";
import { AppContext } from "../AppContext";
import { prepareContainer } from "./PrepareDIContainer";
import { registerCoreListeners } from "./RegisterEventListeners";

export async function prepareAppContext(): Promise<AppContext> {
    const container = prepareContainer();
    const events = await registerCoreListeners();

    return {
        container: container as ContainerType,
        listeners: events,
        prisma: Container.get("PRISMA")
    }
}