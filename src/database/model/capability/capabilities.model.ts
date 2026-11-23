import {Field, ID, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {IsOptional, ValidateNested, ValidatePromise} from 'class-validator';
import {
	BeforeInsert,
	BeforeUpdate,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {AttackCapabilityModel} from '@warp-core/database/model/capability/attack-capability.model';
import {ConstructionCapabilityModel} from '@warp-core/database/model/capability/construction-capability.model';
import {DefenseCapabilityModel} from '@warp-core/database/model/capability/defense-capability.model';
import {DetectionCapabilityModel} from '@warp-core/database/model/capability/detection-capability.model';
import {HealingCapabilityModel} from '@warp-core/database/model/capability/healing-capability.model';
import {MovementCapabilityModel} from '@warp-core/database/model/capability/movement-capability.model';
import {ProductionCapabilityModel} from '@warp-core/database/model/capability/production-capability.model';
import {StealthCapabilityModel} from '@warp-core/database/model/capability/stealth-capability.model';
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

	@Field(() => [MovementCapabilityModel], {
		description: 'Movement layers where the unit is able to move',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToMany(() => MovementCapabilityModel, movement => movement.capabilities, {
		lazy: true,
		nullable: true,
		persistence: false,
		cascade: true,
	})
	@Type(() => MovementCapabilityModel)
	public movement?:
		| MovementCapabilityModel[]
		| Promise<MovementCapabilityModel[]>
		| null;

	@Field(() => AttackCapabilityModel, {
		description: 'How the unit attacks',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToOne(() => AttackCapabilityModel, {
		lazy: true,
		cascade: true,
		nullable: true,
	})
	@JoinColumn({name: 'attackId'})
	@Type(() => AttackCapabilityModel)
	public attack?:
		| AttackCapabilityModel
		| Promise<AttackCapabilityModel | null>
		| null;

	@Field(() => DefenseCapabilityModel, {
		description: 'How the unit defends',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToOne(() => DefenseCapabilityModel, {
		lazy: true,
		cascade: true,
		nullable: true,
	})
	@JoinColumn({name: 'defenseId'})
	@Type(() => DefenseCapabilityModel)
	public defense?:
		| DefenseCapabilityModel
		| Promise<DefenseCapabilityModel | null>
		| null;

	@Field(() => ConstructionCapabilityModel, {
		description: 'What units can be built',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToOne(() => ConstructionCapabilityModel, {
		lazy: true,
		cascade: true,
		nullable: true,
	})
	@JoinColumn({name: 'constructionId'})
	@Type(() => ConstructionCapabilityModel)
	public construction?:
		| ConstructionCapabilityModel
		| Promise<ConstructionCapabilityModel | null>
		| null;

	@Field(() => HealingCapabilityModel, {
		description: 'How the unit heals others',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToOne(() => HealingCapabilityModel, {
		lazy: true,
		cascade: true,
		nullable: true,
	})
	@JoinColumn({name: 'healingId'})
	@Type(() => HealingCapabilityModel)
	public healing?:
		| HealingCapabilityModel
		| Promise<HealingCapabilityModel | null>
		| null;

	@Field(() => DetectionCapabilityModel, {
		description: 'What the unit is able to see',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToOne(() => DetectionCapabilityModel, {
		lazy: true,
		cascade: true,
		nullable: true,
	})
	@JoinColumn({name: 'detectionId'})
	@Type(() => DetectionCapabilityModel)
	public detection?:
		| DetectionCapabilityModel
		| Promise<DetectionCapabilityModel | null>
		| null;

	@Field(() => StealthCapabilityModel, {
		description: 'How well the unit hides',
		nullable: true,
	})
	@ValidateNested()
	@ValidatePromise()
	@IsOptional()
	@OneToOne(() => StealthCapabilityModel, {
		lazy: true,
		cascade: true,
		nullable: true,
	})
	@JoinColumn({name: 'stealthId'})
	@Type(() => StealthCapabilityModel)
	public stealth?:
		| StealthCapabilityModel
		| Promise<StealthCapabilityModel | null>
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

		const movement = (await this.movement) ?? [];
		for (const singleMovement of movement) {
			if (!(await singleMovement.capabilities)) {
				singleMovement.capabilities = this;
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
