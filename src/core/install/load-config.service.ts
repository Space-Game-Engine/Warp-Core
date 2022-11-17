import * as fs from 'fs';
import * as yaml from 'js-yaml';

export class LoadConfigService {

    fetchConfig(configDirectory: string): any {
        if (fs.existsSync(configDirectory) === false) {
            throw new Error("Installation directory does not exists: " + configDirectory);
        }

        const items = fs.readdirSync(configDirectory, { withFileTypes: true })
            .filter(item => !item.isDirectory())
            .map(item => {
                return yaml
                    .load(
                        fs.readFileSync(
                            `${configDirectory}/${item.name}`,
                            'utf8'
                        )
                    )
            });

        return items;
    }
}