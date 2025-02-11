import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({name: 'installation-details-model'})
export class InstallationDetailsModel {
	@PrimaryGeneratedColumn()
	public id: number;

	@Column('boolean', {
		default: true,
	})
	public successfulInstall: boolean = true;

	@CreateDateColumn()
	public installationDate: Date;
}
