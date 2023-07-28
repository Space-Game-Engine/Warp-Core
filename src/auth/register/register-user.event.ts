export class RegisterUserEvent {
	private habitatId: number;

	constructor(private readonly userId: number) {}

	getUserId(): number {
		return this.userId;
	}

	setHabitatId(habitatId: number) {
		if (this.habitatId) {
			return;
		}

		this.habitatId = habitatId;
	}

	getHabitatId(): number {
		return this.habitatId;
	}
}
