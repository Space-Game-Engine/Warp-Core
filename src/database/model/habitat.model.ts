import {Field, ID, ObjectType} from '@nestjs/graphql';
import {IsBoolean, IsNumber} from 'class-validator';
import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';

import {AuthModelInterface} from '@warp-core/auth/interface/auth-model.interface';
import {BuildingQueueElementModel} from '@warp-core/database/model/building-queue-element.model';
import {BuildingZoneModel} from '@warp-core/database/model/building-zone.model';
import {HabitatResourceCombined} from '@warp-core/database/model/habitat-resource.mapped.model';
import {HabitatResourceModel} from '@warp-core/database/model/habitat-resource.model';

@ObjectType({description: 'Single habitat that belongs to user'})
@Entity({name: 'habitat'})
export class HabitatModel implements AuthModelInterface {
	@Field(() => ID)
	@IsNumber()
	@PrimaryGeneratedColumn()
	public id: number;

	@Field({description: 'Custom name of the habitat'})
	@Column('varchar')
	public name: string;

	@Field()
	@IsNumber()
	@Column('int')
	public userId: number;

	@Field({description: 'Is that habitat a capital one'})
	@IsBoolean()
	@Column('boolean')
	public isMain: boolean;

	@Field(() => [BuildingZoneModel])
	@OneToMany(() => BuildingZoneModel, buildingZone => buildingZone.habitat, {
		lazy: true,
	})
	public buildingZones: BuildingZoneModel[] | Promise<BuildingZoneModel[]>;

	@Field(() => [HabitatResourceCombined])
	@OneToMany(
		() => HabitatResourceModel,
		habitatResource => habitatResource.habitat,
		{
			lazy: true,
		},
	)
	public habitatResources:
		| HabitatResourceModel[]
		| Promise<HabitatResourceModel[]>;

	@Field(() => [BuildingQueueElementModel])
	@OneToMany(
		() => BuildingQueueElementModel,
		async queueElement => (await queueElement.buildingZone).habitat,
		{
			lazy: true,
		},
	)
	public buildingQueue:
		| BuildingQueueElementModel[]
		| Promise<BuildingQueueElementModel[]>;

	public getAuthId(): string {
		return this.id.toString();
	}
}
