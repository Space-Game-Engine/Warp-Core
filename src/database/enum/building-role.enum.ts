import { registerEnumType } from "@nestjs/graphql";

export enum BuildingRole {
    RESOURCE_PRODUCTION = "resource",
    TECHNOLOGY_PRODUCTION = "technology",
    UNIT_PRODUCTION = "unit",
}

registerEnumType(BuildingRole, {
    name: "Building_role",
    description: "What kind of buildings are available?",
    valuesMap: {
        RESOURCE_PRODUCTION: {
            description: "Creates one or more types of resource",
        },
        TECHNOLOGY_PRODUCTION: {
            description: "Develop some kind of technology",
        },
        UNIT_PRODUCTION: {
            description: "Recruit units for your army",
        },
    },
});