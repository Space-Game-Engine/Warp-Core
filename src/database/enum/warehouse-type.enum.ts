import {registerEnumType} from "@nestjs/graphql";

export enum WarehouseTypeEnum {
    ANY_RESOURCE = "any",
    ONE_TYPE_OF_RESOURCE = "by_resource_type",
    ONE_KIND_OF_RESOURCE = "by_resource_id",
}

registerEnumType(WarehouseTypeEnum, {
    name: "Warehouse_type",
    description: "What kind of resource can be stored here?",
    valuesMap: {
        ANY_RESOURCE: {
            description: "Any kind of resource can be stored here",
        },
        ONE_TYPE_OF_RESOURCE: {
            description: "Any resource with common type can be stored here",
        },
        ONE_KIND_OF_RESOURCE: {
            description: "Only one resource can be stored here, nothing else",
        },
    }
})