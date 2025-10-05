import {InjectionToken} from '@nestjs/common/interfaces/modules/injection-token.interface';

interface MechanicMetadata {
	group: InjectionToken;
	alias: string;
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	mechanicClass: Function;
}
export class MechanicsMetadataRegistry {
	private static mechanics: MechanicMetadata[] = [];

	public static add(mechanic: MechanicMetadata): void {
		this.mechanics.push(mechanic);
	}

	public static findByGroup(group: InjectionToken): MechanicMetadata[] {
		return this.mechanics.filter(m => m.group === group);
	}
}
