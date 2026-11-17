import type {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';

/**
 * Anything that defines capabilities: a global blueprint level, a player blueprint etc.
 */
export interface CapabilitiesOwnerModelInterface {
	capabilities?: CapabilitiesModel | null;
}
