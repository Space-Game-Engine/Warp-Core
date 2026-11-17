/**
 * Common shape of a global blueprint (building, unit etc.).
 * Global blueprints are installed from YAML files and never modified by the engine.
 */
export interface BlueprintGlobalModelInterface {
	id: string;
	name: string;
}
