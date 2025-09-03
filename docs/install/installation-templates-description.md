# Description of installation files

The `install` folder contains template files that define the schema for installation data. These are simple YAML files, with keys representing structured entities from the project.

These files are required at the start, and their content is stored in the database.

To use them, copy the template files into the same directory. The template YAMLs are fully functional and provide a clear example of how the game engine operates.

## Resources

This file contains all possible resources that buildings can produce within the game. The structure of a single entry is as follows:

```yaml
  - id: string id of the resource
    name: Name of the resource
    type: enum
```

Example:

```yaml
  - id: wood
    name: Spruce wood
    type: construction
```

### Keys description
 * `id` _[string]_ must be unique across all resources. It is referenced later in the building template.
 * `name` _[string]_ a descriptive name. It does not need to be unique.
 * `type` _[enum]_ must match one of the following values:
   * `construction` resources used for build buildings, such as steel or wood.
   * `energy` resources used to power buildings and unlock technology, such as coal or electrical units.
   * `technology` resources used in technological actions, such as enhancing knowledge or creating units

## Buildings

This file defines the types of buildings that can be constructed. It also describes all building levels, including their requirements and capabilities. The structure of a single entry is as follows:

```yaml
  - role: enum
    name: Name of the building
    id: string id of the building
    buildingDetailsAtCertainLevel: #[array]
      - level: number
        timeToUpdateBuildingInSeconds: time
        requirements: #[optional array, if apply]
          - resourceId: string id of the resource
            cost: number
        warehouse: #[optional array, if apply]
          - warehouseType: enum
            resourceType: enum #[optional, based on warehouseType - see keys description]
            resourceId: string #[optional, based on warehouseType - see keys description]
            amount: number
        productionRate: #[optional array, if apply]
          - resourceId: coal
            productionRate: 1
```

Example (warehouse):

```yaml
  - role: warehouse
    name: Warehouse
    id: warehouse
    buildingDetailsAtCertainLevel:
      - level: 1
        timeToUpdateBuildingInSeconds: 10
        warehouse:
          - warehouseType: by_resource_type
            resourceType: construction
            amount: 100
      - level: 2
        timeToUpdateBuildingInSeconds: 30
        warehouse:
          - warehouseType: by_resource_type
            resourceType: construction
            amount: 200
        requirements:
          - resourceId: wood
            cost: 20
```

Example (mine):

```yaml
  - role: resource
    name: Coal Mine
    id: coal_mine
    buildingDetailsAtCertainLevel:
      - level: 1
        timeToUpdateBuildingInSeconds: 1000
        productionRate:
          - resourceId: coal
            productionRate: 1
        requirements:
          - resourceId: wood
            cost: 20
      - level: 2
        timeToUpdateBuildingInSeconds: 3000
        productionRate:
          - resourceId: coal
            productionRate: 3
        requirements:
          - resourceId: wood
            cost: 100
```

### Keys description
* `id` _[string]_ must be unique across all buildings.
* `name` _[string]_ a descriptive name. It does not need to be unique.
* `role` _[enum]_ defines the type of the building. Must match one of the following values:
  * `resource` produces one or more types of resources, such as a mine or mill.
  * `technology` enables technological development, such as a research centre or university.
  * `unit` recruits units for the army, such as a barracks or shipyard.
  * `warehouse` stores resources according to their type.
* `buildingDetailsAtCertainLevel` _[array]_ defines the behaviour of a building at a specific level, including requirements and other details. If empty, the building cannot be constructed. Based on this data, buildings can be built and upgraded.
  * `level` _[number]_ the level corresponding to this entry, starting from 1.
  * `timeToUpdateBuildingInSeconds` _[number]_ the time in seconds required to build or upgrade the building.
  * `requirements` _[array] (optional)_ rules that define what is needed to upgrade a building. A level can have multiple requirements. If empty, no requirements are needed to upgrade to the next level.
    * `resurce` _[string]_ the `id` of the resource required for the building upgrade
    * `cost` _[number]_ the amount of the resource needed.
  * `productionRate` _[array] (optional)_ describes the production of resources. Each entry specifies what the building produces at this level. If empty, the building produces nothing.
    * `resurce` _[string]_ the `id` of the resource being produced.
    * `productionRate`_[number]_ the amount of the resource produced per second; decimal values are allowed.
  * `warehouse` _[array] (optional)_ defines the resources a building can store. Each entry specifies a resource type or ID and the amount stored. If empty, the building does not store any resources.
    * `warehouseType` _[enum]_ must match one of the following:
      * `any` any type of resource can be stored. Acts as a wildcard.
      * `by_resource_type` stores all resources of a single type, such as `construction`, `energy`, or `technology`.
      * `by_resource_id` stores only a single resource identified by its `id`.
    * `resourceId` _[string] (optional)_ the id of the stored resource. Required if `warehouseType` is `by_resource_id`.
    * `resourceType` _[string] (optional)_ the type of resource from the resource enum. Required if `warehouseType` is `by_resource_type`.
    * `amount` _[number]_ the quantity of resources stored.
