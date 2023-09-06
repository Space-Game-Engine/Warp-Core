import { DataSource } from "typeorm";
import {DataSourceOptions} from 'typeorm/data-source/DataSourceOptions';
import config from '@warp-core/core/config/config-parser';

const databaseConfig = config().database;

const datasource = new DataSource(databaseConfig as DataSourceOptions);

export {datasource};