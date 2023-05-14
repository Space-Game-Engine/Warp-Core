import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

export abstract class AbstractInstalatorService{

    async install(arrayToInstall: any) {
        for (const key in arrayToInstall) {
            if (Object.prototype.hasOwnProperty.call(arrayToInstall, key) === false) {
                continue;
            }
            const elementsToInstall = arrayToInstall[key];
            const modelToSave = plainToInstance(this.getModelType(), elementsToInstall);

            await this.isModelValid(modelToSave);

            await this.saveModel(modelToSave);
        }
    }

    protected async isModelValid(model: any): Promise<boolean> {
        const validationErrors = validateSync(model);

        if (validationErrors.length === 0) {
            return true;
        }

        console.error('Validation error', validationErrors);
        throw new Error("Validation error, see logs");
    }

    protected abstract getModelType(): ReturnType<typeof Object>;

    protected abstract saveModel(modelToSave: object): Promise<void>;
}