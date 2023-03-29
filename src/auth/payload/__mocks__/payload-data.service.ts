import { PayloadDataService } from "@warp-core/auth/payload/payload-data.service";

export class PayloadDataServiceMock extends PayloadDataService {
    constructor() {
        super(null, null);
    }
    getUserId = jest.fn();
    getModel = jest.fn();
    parseDbModel = jest.fn();
}