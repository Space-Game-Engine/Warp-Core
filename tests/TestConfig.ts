import { ConfigParser } from "./../src/config/ConfigParser";

const configParser = new ConfigParser();
export const testConfig = () => configParser.getConfig();
