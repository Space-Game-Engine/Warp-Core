import { EventListener } from "../EventListener";
import Container from "typedi";
import { findFileNamesFromGlob } from "type-graphql/dist/helpers/loadResolversFromGlob";

export async function registerCoreListeners(): Promise<Array<EventListener>> {
    const listenerFilesNames = findFileNamesFromGlob(__dirname + "/src/**/*Listener.ts");
    const listenerObjects: Array<EventListener> = [];
    for (const singleListenerFileName of listenerFilesNames) {
        const listenerName = await require(singleListenerFileName);

        if (!listenerName.default) {
            continue;
        }

        const singleListenerObject: EventListener = Container.get(listenerName.default);
        singleListenerObject.registerListeners();

        listenerObjects.push(singleListenerObject);
    }

    return listenerObjects;
}
