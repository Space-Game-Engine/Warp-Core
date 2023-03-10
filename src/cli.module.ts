import { Module } from '@nestjs/common';
import { AppModule } from '@warp-core/app.module';
import { InstallModule } from '@warp-core/core/install/install.module';
import { CommandModule } from 'nestjs-command';

@Module({
    imports: [
        CommandModule,
        AppModule,
        InstallModule,
    ]
})
export class ClIModule { }