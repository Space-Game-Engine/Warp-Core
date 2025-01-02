import {Test, TestingModule} from '@nestjs/testing';

import {AppModule} from '@warp-core/app.module';

export function e2eModule(): Promise<TestingModule> {
	return Test.createTestingModule({imports: [AppModule]}).compile();
}
