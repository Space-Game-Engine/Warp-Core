import {validateSync} from 'class-validator';
import {plainToInstance} from 'class-transformer';
import {CoreConfig} from './model/core.config';

class ConfigParser {
	private loadedConfig: CoreConfig;

	getConfig(): CoreConfig {
		if (!this.loadedConfig) {
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const config = require('config');
			this.loadedConfig = plainToInstance(CoreConfig, config);

			this.isConfigValid(this.loadedConfig);
		}

		return this.loadedConfig;
	}

	private isConfigValid(config: CoreConfig): boolean {
		const validationErrors = validateSync(config);

		if (validationErrors.length === 0) {
			return true;
		}

		console.error('Validation error', validationErrors);
		throw new Error('Validation error, see logs');
	}
}

let configParser: ConfigParser;

export default (): CoreConfig => {
	if (!configParser) {
		configParser = new ConfigParser();
	}

	return configParser.getConfig();
};
