import {MigrationInterface, QueryRunner} from 'typeorm';

import {HabitatModel} from '@warp-core/database';

export class HabitatMigration1577836801000 implements MigrationInterface {
	public readonly habitatsToMigrate = [
		{
			id: 1,
			userId: 1,
			isMain: true,
			name: 'first test habitat',
		},
	] as HabitatModel[];

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const habitatModel of this.habitatsToMigrate) {
			await queryRunner.manager.insert(HabitatModel, habitatModel);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.manager.clear(HabitatModel);
	}
}
