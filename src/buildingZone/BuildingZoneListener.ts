import {Inject, Service} from "typedi";
import {EventListener} from "../core/EventListener";
import {BuildingZoneService} from "./BuildingZoneService";

@Service()
export default class BuildingZoneListener extends EventListener {

    @Inject()
    private readonly buildingZoneService: BuildingZoneService;

    registerListeners() {
        this.registerNewListener('habitat.create_new', async (newHabitat) => {
            await this.buildingZoneService.createBuildingZoneOnNewHabitatCreation(newHabitat);
        });
    }
}
