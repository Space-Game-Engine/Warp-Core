import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { HabitatModel } from "../../habitat/model/habitat.model";
import { PayloadInterface } from "../interface/payload.interface";
import { AccessToken } from "./access-token.model";
import { LoginInterface } from "./login.interface";

@Injectable()
export class LoginByHabitatService implements LoginInterface {
    constructor(
        private jwtService: JwtService
    ) { }

    async login(habitat: HabitatModel): Promise<AccessToken> {
        const payload = {
            dbModel: habitat,
            sub: habitat.userId
        } as PayloadInterface;

        return {
            access_token: `Bearer ${this.jwtService.sign(payload)}`,
        } as AccessToken;
    }
}