# Mechanics

Warp Core game engine provides multiple mechanics. They define different ways of processing a single task without the need to going into details. They are meant to be possible to switch just in a config file. All mechanic configs are stored in one `default.yaml` file under a specific key. Mechanics are grouped, it is possible to select only one mechanic from a group.

## Mechanics list

### `resource.calculation`

Group of mechanics that calculate resources for a single habitat. Possible values:

#### `'no-distance-simple-multiply'`

That mechanic just multiplies time with the production rate and adds the last calculated value. Limited by existing warehouse storage in habitat.

### `resource.warehouse`

Group of mechanics that decides how to process with warehouse storage. Possible values:

#### `'base-resource-summary'`

Gets all build warehouses and calculates possible storage per provided resource.

#### `'disabled'`

Warehouses are not used. The max possible value of a single resource is 9007199254740991.

### `queue.building.resourceConsumer`

Group of mechanics that decides how to consume resources on building queue change. Based on this mechanic, queue cost calculates.

#### `'simple-resource-consumer'`

Fetches all resources related to the newly added building (or draft) and summarize them in a loop.
