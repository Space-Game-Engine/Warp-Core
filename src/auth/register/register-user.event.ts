export class RegisterUserEvent {
	private habitatId: number;

	constructor(private readonly userId: number) {}

	public getUserId(): number {
		return this.userId;
	}

	public setHabitatId(habitatId: number): void {
		if (this.habitatId) {
			return;
		}

		this.habitatId = habitatId;
	}

	public getHabitatId(): number {
		return this.habitatId;
	}
}
