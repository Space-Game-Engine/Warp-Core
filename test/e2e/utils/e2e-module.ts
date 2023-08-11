import {Test, TestingModule} from '@nestjs/testing';
import {AppModule} from '@warp-core/app.module';

export async function e2eModule() {
	return await Test
		.createTestingModule({imports: [AppModule]})
		.compile();
}