import {DeepMockProxy, mockDeep} from 'jest-mock-extended'
import CoreEventEmitter from "../src/CoreEventEmitter";

export type MockEventEmitter = DeepMockProxy<CoreEventEmitter>

export const createEventEmitterMock = (): MockEventEmitter => {
    return mockDeep<CoreEventEmitter>();
}
