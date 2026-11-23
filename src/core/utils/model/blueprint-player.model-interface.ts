import {BlueprintGlobalModelInterface} from '@warp-core/core/utils/model/blueprint-global.model-interface';
import type {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Common shape of a player blueprint: a per-habitat view of a global blueprint
 * that holds bonus capabilities gathered by the player (technology etc.).
 */
export interface BlueprintPlayerModelInterface<
	TGlobal extends BlueprintGlobalModelInterface,
> {
	id: number;
	habitatId: number;
	capabilities: CapabilitiesModel | Promise<CapabilitiesModel>;

	/**
	 * Returns the global blueprint that player blueprint is based on.
	 */
	getGlobalBlueprint(): Promise<TGlobal>;
}
