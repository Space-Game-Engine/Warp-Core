import {Field, ID, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {IsOptional, ValidateNested} from 'class-validator';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {CapabilitiesOwnerModelInterface} from '@warp-core/core/utils/model/capabilities-owner.model-interface';
import {BuildingBlueprintGlobalModel} from '@warp-core/database/model/building/building-blueprint-global.model';
import {CapabilitiesModel} from '@warp-core/database/model/capability/capabilities.model';
import {DetailsAtCertainLevelModel} from '@warp-core/database/model/level-details/details-at-certain-level.model';

@ObjectType({
	description: 'Details how to upgrade single building',
})
@Entity({name: 'building-details-at-certain-level'})
export class BuildingDetailsAtCertainLevelModel implements CapabilitiesOwnerModelInterface {
	@Field(() => ID, {description: 'Id of building level details'})
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => DetailsAtCertainLevelModel, {
		description: 'The details of certain level',
	})
	@OneToOne(() => DetailsAtCertainLevelModel, {
		cascade: true,
		eager: true,
	})
	@JoinColumn({name: 'detailsId'})
	@ValidateNested()
	@Type(() => DetailsAtCertainLevelModel)
	public details: DetailsAtCertainLevelModel;

	@Column({name: 'detailsId'})
	public detailsId: number;

	@Field(() => BuildingBlueprintGlobalModel, {
		description: 'Building connected to that details',
	})
	@ManyToOne(
		() => BuildingBlueprintGlobalModel,
		building => building.buildingDetailsAtCertainLevel,
		{
			lazy: true,
		},
	)
	@JoinColumn({name: 'buildingId'})
	public building:
		| BuildingBlueprintGlobalModel
		| Promise<BuildingBlueprintGlobalModel>;

	@Column({name: 'buildingId', nullable: true})
	public buildingId?: string | null;

	@Field(() => CapabilitiesModel, {
		description:
			'Global capabilities of the building on that level (production, storage). Empty when the level does nothing on its own.',
		nullable: true,
	})
	@ValidateNested()
	@IsOptional()
	@OneToOne(() => CapabilitiesModel, {
		cascade: true,
		eager: true,
		nullable: true,
	})
	@JoinColumn({name: 'capabilitiesId'})
	@Type(() => CapabilitiesModel)
	public capabilities?: CapabilitiesModel | null;

	@Column({name: 'capabilitiesId', nullable: true})
	public capabilitiesId?: number | null;
}
