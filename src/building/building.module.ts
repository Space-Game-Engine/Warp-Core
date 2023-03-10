import { Module } from "@nestjs/common";
import { DatabaseModule } from "@warp-core/database/database.module";
import { BuildingResolver } from "./building.resolver";
import { BuildingService } from "./building.service";


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