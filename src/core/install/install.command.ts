import { Command, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { BuildingInstallService } from './building-install.service';
import { LoadConfigService } from './load-config.service';

@Injectable()
export class InstallCommand {
    constructor(
        private readonly buildingInstall: BuildingInstallService,
        private readonly loadConfig: LoadConfigService
    ) { }

    @Command({
        command: 'install',
        describe: 'installs basics of game data',
    })
    async install(
        @Option({
            name: 'directory',
            describe: 'directory where yaml files are placed',
            type: 'string',
            alias: 'd',
            default: __dirname + '/../../../install',
            required: false
        })
        directory: string
    ){
        const installationConfig = this.loadConfig.fetchConfig(directory);

        await this.buildingInstall.install(installationConfig[0].buildings);
    }
}