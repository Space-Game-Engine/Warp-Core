export function prepareRepositoryMock(repositoryType: any) {
        const manager = {
            save: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        jest.spyOn(repositoryType.prototype, 'createSharedTransaction')
            .mockImplementation(() => {
                return [123, manager];
            });

        jest.spyOn(repositoryType.prototype, 'getSharedTransaction')
            .mockImplementation(() => {
                return manager;
            });

        jest.spyOn(repositoryType.prototype, 'commitSharedTransaction')
            .mockImplementation(() => {
                return manager;
            });

        jest.spyOn(repositoryType.prototype, 'rollbackSharedTransaction')
            .mockImplementation(() => {
                return manager;
            });
}