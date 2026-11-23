# Blueprints, capabilities and instances

Everything a player can build in `Warp Core` follows the same three layers. Buildings and units use them.

| Layer | Buildings | Who creates it |
|---|---|---|
| Global blueprint | `BuildingBlueprintGlobalModel` with `buildingDetailsAtCertainLevel` | installation from `install/buildings.yaml`, never changed by the engine |
| Player blueprint | `BuildingBlueprintPlayerModel` | the engine, the first time a habitat builds that building |
| Instance | `BuildingZoneModel` | the engine, when a habitat is created (empty zones) and when the building queue finishes |

Units follow the same layers: `UnitBlueprintGlobalModel` (installation from `install/units.yaml`), `UnitBlueprintPlayerModel` (hidden, created when the first unit is built in a habitat) and `UnitInstanceModel` (one row per built unit).

## Global blueprint

The global blueprint is shared by every habitat in the world. For buildings it defines the role, the name and one entry per level: how long the upgrade takes, what it requires and which **capabilities** the building has on that level.

Capabilities are a shared container (`CapabilitiesModel`) with:

* `production` resource flows: `resourceId`, `amount` and `interval` in seconds (`amount: 1, interval: 1` is one unit per second),
* `storage` entries: `storageType` (`any`, `by_resource_type`, `by_resource_id`), the matching `resourceType` or `resourceId`, and `amount`.

Query the global blueprints with `building_getAll` and `building_get(id)`.

## Player blueprint

A player blueprint belongs to one habitat and one global blueprint (there is exactly one per pair). It is created the first time an instance of that building is built in the habitat, either from the `onStart` configuration or when a building queue element is processed. It stays even when the building is removed.

The player blueprint carries one set of **bonus capabilities**. They start empty and will be changed by player actions such as researched technologies (the update rules are a separate task).

Query them with `buildingBlueprint_getAll` and `buildingBlueprint_get(buildingId)`.

## Instance and effective capabilities

A building zone is an instance of a player blueprint. It knows its level and which player blueprint (and therefore which global blueprint) it was built from.

The **effective capabilities** of a zone are calculated by the building-zone module as:

```
global capabilities of the zone's level + player blueprint bonus capabilities
```

* Production flows are summed per resource. The interval of the global flow is kept and bonus flows are rescaled to it, so `amount: 1, interval: 1` plus a bonus of `amount: 1, interval: 2` gives `amount: 1.5, interval: 1`.
* Storage entries with the same storage type, resource type and resource id are summed. Entries with different rules stay separate; all entries that accept a resource count towards its storage limit.

Every resource calculation (production rate shown on resources, storage limits, recalculation when a queue element finishes) uses these effective values. They are exposed on `buildingZone_get` / `buildingZone_getAll` as the `capabilities` field.

## Units

`UnitBlueprintGlobalModel` is the global blueprint of a unit, installed from `install/units.yaml`. It has a kind (`mobile` / `stationary`), designer tags, `timeToBuildInSeconds` and `requirements` (cost of one unit, stored as `RequirementsPerLevelModel` rows). Units have no levels and one set of capabilities. Capabilities of units use the same `CapabilitiesModel` as buildings, extended with movement, attack, defense, construction, healing, detection and stealth. Query them with `unit_getAll` and `unit_get(id)`; other modules read them through `UnitQueryEmitter` from `@warp-core/global/unit`.

### Building units

Units are built with the unit queue (`unitQueue_add`, `unitQueue_getDraft`, `unitQueue_getAll`). It works like the building and research queues (one queue per habitat, costs are paid when an element is added, drafts do not change anything) but a queue element has an `amount` instead of levels:

* the cost is the cost of a single unit (`requirements` of the global blueprint) multiplied by `amount`,
* the time is `timeToBuildInSeconds` multiplied by `amount`,
* building and research node requirements of the unit have to be met by the habitat,
* the unit has to be listed in the `construction.buildableUnits` capability of a building placed in the habitat (current level or player bonus) or of a unit that already belongs to the habitat.

When a queue element finishes, the engine creates `amount` separate `UnitInstanceModel` rows. The player blueprint of the unit is created together with the first instance and stays afterwards. The player blueprint is a hidden layer: it is not exposed in GraphQL. Users query their units with `unitInstance_getAll`; every unit has its `unit` (global blueprint) and effective `capabilities` (global blueprint capabilities plus player blueprint bonuses, summed like building zone capabilities). The `user/unit-instance` module owns that logic, other modules create units through `UnitInstanceQueryEmitter`.

The maximum length of the queue is set in `runtime.habitat.unitQueue.maxElementsInQueue`. The way costs are calculated is a mechanic, see `queue.unit.resourceConsumer` in `docs/mechanics.md`.
