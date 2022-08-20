import { validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CoreConfig } from "./model/CoreConfig";

export class ConfigParser {

    getConfig(): CoreConfig {
        const config = require('config');
        const coreConfig = plainToInstance(CoreConfig, config);

        this.isConfigValid(coreConfig);

        return coreConfig;
    }

    private isConfigValid(config: CoreConfig): boolean {
        const validationErrors = validateSync(config);

        if (validationErrors.length === 0) {
            return true;
        }

        console.error('Validation error', validationErrors);
        throw new Error("Validation error, see logs");
    }
}