import {PrismaClient} from '@prisma/client'
import {DeepMockProxy, mockDeep} from 'jest-mock-extended'

export type MockPrismaClient = DeepMockProxy<PrismaClient>

export const createPrismaClientMock = (): MockPrismaClient => {
    return mockDeep<PrismaClient>();
}
