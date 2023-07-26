import {RuntimeConfig} from "@warp-core/core/config/runtime.config";
import {plainToInstance} from "class-transformer";
import {CoreConfig} from "@warp-core/core/config/model/core.config";

export const coreConfigMock = {
    provide: RuntimeConfig,
    useFactory: () => {
        const config = require('config');
        return plainToInstance(CoreConfig, config).runtime;
    }
}