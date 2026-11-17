import {Field, ID, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {IsOptional, ValidateNested, ValidatePromise} from 'class-validator';
import {
	BeforeInsert,
	BeforeUpdate,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {ProductionCapabilityModel} from '@warp-core/database/model/capability/production-capability.model';
import {StorageCapabilityModel} from '@warp-core/database/model/capability/storage-capability.model';

@ObjectType({
	description:
		'Set of capabilities, shared by blueprints of buildings and units (global ones per level, player ones as bonuses)',
})
@Entity({name: 'capabilities'})
export class CapabilitiesModel {
	@Field(() => ID, {description: 'Id of capabilities set'})
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => [ProductionCapabilityModel], {
		description:
			'Resources produced by that capabilities set. One entry per produced resource.',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(
		() => ProductionCapabilityModel,
		production => production.capabilities,
		{
			lazy: true,
			nullable: true,
			persistence: false,
			cascade: true,
		},
	)
	@Type(() => ProductionCapabilityModel)
	public production?:
		| ProductionCapabilityModel[]
		| Promise<ProductionCapabilityModel[]>
		| null;

	@Field(() => [StorageCapabilityModel], {
		description: 'Resources stored by that capabilities set',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(() => StorageCapabilityModel, storage => storage.capabilities, {
		lazy: true,
		nullable: true,
		persistence: false,
		cascade: true,
	})
	@Type(() => StorageCapabilityModel)
	public storage?:
		| StorageCapabilityModel[]
		| Promise<StorageCapabilityModel[]>
		| null;

	@BeforeInsert()
	@BeforeUpdate()
	public async setOneToManyRelations(): Promise<void> {
		const production = (await this.production) ?? [];
		for (const singleProduction of production) {
			if (!(await singleProduction.capabilities)) {
				singleProduction.capabilities = this;
			}
		}

		const storage = (await this.storage) ?? [];
		for (const singleStorage of storage) {
			if (!(await singleStorage.capabilities)) {
				singleStorage.capabilities = this;
			}
		}
	}
}
