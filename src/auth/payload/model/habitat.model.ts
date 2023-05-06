import { HabitatModel as DbHabitatModel } from "@warp-core/database/model/habitat.model";
import { InjectableProxy } from "nestjs-cls";

@InjectableProxy()
export class AuthorizedHabitatModel extends DbHabitatModel {}