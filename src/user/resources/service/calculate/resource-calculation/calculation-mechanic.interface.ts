import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';

export abstract class CalculationMechanic {
	/**
	 * Calculate production rate for single resource
	 * @param habitatResource
	 */
	public abstract getProductionRate(
		habitatResource: HabitatResourceModel,
	): Promise<number>;

	/**
	 * Calculate current resource value
	 * @param habitatResource
	 * @param secondsToCalculateResources
	 */
	public abstract calculateCurrentResourceValue(
		habitatResource: HabitatResourceModel,
		secondsToCalculateResources: number,
	): Promise<number>;
}
