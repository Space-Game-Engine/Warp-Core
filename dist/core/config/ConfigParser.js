"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const CoreConfig_1 = require("./model/CoreConfig");
class ConfigParser {
    getConfig() {
        if (!this.loadedConfig) {
            const config = require('config');
            this.loadedConfig = (0, class_transformer_1.plainToInstance)(CoreConfig_1.CoreConfig, config);
            this.isConfigValid(this.loadedConfig);
        }
        return this.loadedConfig;
    }
    isConfigValid(config) {
        const validationErrors = (0, class_validator_1.validateSync)(config);
        if (validationErrors.length === 0) {
            return true;
        }
        console.error('Validation error', validationErrors);
        throw new Error("Validation error, see logs");
    }
}
let configParser;
exports.default = () => {
    if (!configParser) {
        configParser = new ConfigParser();
    }
    return configParser.getConfig();
};
//# sourceMappingURL=ConfigParser.js.map