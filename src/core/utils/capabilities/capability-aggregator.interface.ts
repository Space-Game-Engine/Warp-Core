import {CalculatedCapabilitiesModel} from '@warp-core/database/model/capability/calculated-capabilities.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Sums a single kind of capability (e.g. production, storage) from many sources.
 * To support a new capability, add a new aggregator and register it in `SumCapabilitiesModule`.
 * `SumCapabilitiesService` does not need to change.
 */
export abstract class CapabilityAggregatorInterface<TState> {
	/**
	 * Creates empty accumulator, used for a single sum operation.
	 */
	public abstract createState(): TState;

	/**
	 * Adds the capability handled by this aggregator from a single source into the accumulator.
	 */
	public abstract addSource(
		state: TState,
		source: CapabilitiesModel,
	): Promise<void>;

	/**
	 * Writes the accumulated values into the final result.
	 */
	public abstract applyToResult(
		state: TState,
		result: CalculatedCapabilitiesModel,
	): void;
}
