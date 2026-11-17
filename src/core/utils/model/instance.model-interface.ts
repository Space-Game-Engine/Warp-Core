/**
 * Common shape of a blueprint instance (building zone, unit instance etc.).
 */
export interface InstanceModelInterface<TPlayerBlueprint> {
	id: number;
	habitatId: number;

	/**
	 * Returns the player blueprint that instance was created from,
	 * or null when the instance is empty (e.g. a building zone without a building).
	 */
	getPlayerBlueprint(): Promise<TPlayerBlueprint | null>;
}
