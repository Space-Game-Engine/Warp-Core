import CoreEventEmitter from "./CoreEventEmitter";
import {Inject, Service} from "typedi";

@Service()
export abstract class EventListener {
    @Inject("CORE_EVENT_EMITTER")
    protected eventEmitter: CoreEventEmitter;

    public abstract registerListeners();

    protected registerNewListener(eventName: string, functionToCall: Function) {
        this.eventEmitter.on(eventName, functionToCall);
    }
}
