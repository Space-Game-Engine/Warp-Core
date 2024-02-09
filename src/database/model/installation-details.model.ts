import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({name: 'installation-details-model'})
export class InstallationDetailsModel {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('boolean', {
		default: true
	})
	successfulInstall: boolean = true;

	@CreateDateColumn()
	installationDate: Date;
}