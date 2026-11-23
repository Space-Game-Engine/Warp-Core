import {Field, ObjectType} from '@nestjs/graphql';
import {Type} from 'class-transformer';
import {ArrayNotEmpty, ValidateNested, ValidatePromise} from 'class-validator';
import {
	BeforeInsert,
	BeforeUpdate,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';

import {ConstructionBuildableUnitModel} from '@warp-core/database/model/capability/construction-buildable-unit.model';

@ObjectType({
	description: 'Construction capability: which units can be built by the owner',
})
@Entity({name: 'construction-capability'})
export class ConstructionCapabilityModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Field(() => [ConstructionBuildableUnitModel], {
		description: 'Units that can be built',
	})
	@ValidateNested()
	@ValidatePromise()
	@ArrayNotEmpty()
	@OneToMany(
		() => ConstructionBuildableUnitModel,
		buildable => buildable.constructionCapability,
		{
			lazy: true,
			persistence: false,
			cascade: true,
		},
	)
	@Type(() => ConstructionBuildableUnitModel)
	public buildableUnits:
		| ConstructionBuildableUnitModel[]
		| Promise<ConstructionBuildableUnitModel[]>;

	@BeforeInsert()
	@BeforeUpdate()
	public async setOneToManyRelations(): Promise<void> {
		for (const buildable of await this.buildableUnits) {
			if (!(await buildable.constructionCapability)) {
				buildable.constructionCapability = this;
			}
		}
	}
}
