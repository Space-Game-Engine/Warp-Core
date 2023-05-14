import { BuildingModel } from '@warp-core/database/model/building.model';
import { ResourceModel } from '@warp-core/database/model/resource.model';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

export class LoadConfigService {

    fetchConfig(configDirectory: string): {resources: ResourceModel[], buildings: BuildingModel[]} {
        if (fs.existsSync(configDirectory) === false) {
            throw new Error("Installation directory does not exists: " + configDirectory);
        }

        const items = fs.readdirSync(configDirectory, { withFileTypes: true })
            .filter(item => !item.isDirectory())
            .filter(item => !item.name.includes('template'))
            .map(item => {
                return yaml
                    .load(
                        fs.readFileSync(
                            `${configDirectory}/${item.name}`,
                            'utf8'
                        )
                    )
            });

        return Object.assign({}, ...items);
    }
}