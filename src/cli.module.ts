import {Module} from '@nestjs/common';
import {CommandModule} from 'nestjs-command';

import {AppModule} from '@warp-core/app.module';
import {InstallModule} from '@warp-core/core/install/install.module';

@Module({
	imports: [CommandModule, AppModule, InstallModule.register()],
})
export class ClIModule {}
