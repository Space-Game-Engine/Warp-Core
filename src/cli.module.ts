import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { AppModule } from './app.module';
import { InstallModule } from './core/install/install.module';

@Module({
    imports: [
        CommandModule,
        AppModule,
        InstallModule,
    ]
})
export class CliModule { }