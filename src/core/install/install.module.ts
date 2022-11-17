import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BuildingModel } from "../../building/model/building.model";
import { BuildingInstallService } from "./building-install.service";
import { InstallCommand } from "./install.command";
import { LoadConfigService } from "./load-config.service";

@Module({
    providers: [
        BuildingInstallService,
        LoadConfigService,
        InstallCommand
    ],
    imports: [
        TypeOrmModule.forFeature([BuildingModel]),
    ]
})
export class InstallModule {}