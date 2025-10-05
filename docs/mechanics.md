# Mechanics

Warp Core game engine provides multiple mechanics. They define different ways of processing single task without need to going into details. They are meant to be possible to switch just in config file. All mechanic configs are stored in one `default.yaml` file under specific key. Mechanics are grouped, it is possible to select only one mechanic from group.

## Mechanics list

### `resource.calculation`

Group of mechanics that calculate resources for single habitat. Possible values:

#### `'no-distance-simple-multiply'`

That mechanic just multiplies time with production rate and adds last calculated value. Limited by existing warehouse storage in habitat.

### `resource.warehouse`

Group of mechanics that decides how to process with warehouse storage. Possible values:

#### `'base-resource-summary'`

Gets all build warehouses and calculates possible storage per provided resource.

#### `'disabled'`

Warehouses are not used. Max possible value of single resource is 9007199254740991.
