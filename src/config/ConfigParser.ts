import { validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { HabitatConfig } from "./model/HabitatConfig";

export class ConfigParser {

    getConfig(): HabitatConfig {
        const config = require('config');
        const habitatConfig = plainToInstance(HabitatConfig, config.habitat);

        this.isConfigValid(habitatConfig);

        return habitatConfig;
    }

    private isConfigValid(config: HabitatConfig): boolean {
        const validationErrors = validateSync(config);

        if (validationErrors.length === 0) {
            return true;
        }

        console.error('Validation error', validationErrors);
        throw new Error("Validation error, see logs");


        return false;
    }
}