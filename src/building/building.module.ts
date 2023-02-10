import { Module } from "@nestjs/common";
import { BuildingResolver } from "./building.resolver";
import { BuildingService } from "./building.service";
import { DatabaseModule } from "../database/database.module";


@Module({
    providers: [
        BuildingService,
        BuildingResolver
    ],
    imports: [
        DatabaseModule,
    ],
    exports: [
        BuildingService,
    ]
})
export class BuildingModule {}