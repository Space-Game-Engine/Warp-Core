import { Module } from "@nestjs/common";
import { InstallCommand } from "./install.command";
import { LoadConfigService } from "./load-config.service";
import { DatabaseModule } from "@warp-core/database";
import { BuildingInstallService } from "@warp-core/core/install/service/building-install.service";
import { ResourcesInstallService } from "@warp-core/core/install/service/resources-install.service";

@Module({
    providers: [
        BuildingInstallService,
        ResourcesInstallService,
        LoadConfigService,
        InstallCommand
    ],
    imports: [
        DatabaseModule,
    ]
})
export class InstallModule {}