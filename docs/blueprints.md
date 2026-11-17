# Blueprints, capabilities and instances

Everything a player can build in `Warp Core` follows the same three layers. Buildings use them today; units will reuse them.

| Layer | Buildings | Who creates it |
|---|---|---|
| Global blueprint | `BuildingBlueprintGlobalModel` with `buildingDetailsAtCertainLevel` | installation from `install/buildings.yaml`, never changed by the engine |
| Player blueprint | `BuildingBlueprintPlayerModel` | the engine, the first time a habitat builds that building |
| Instance | `BuildingZoneModel` | the engine, when a habitat is created (empty zones) and when the building queue finishes |

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
