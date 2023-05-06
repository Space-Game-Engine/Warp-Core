import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PayloadInterface } from "@warp-core/auth/interface/payload.interface";
import { AccessToken } from "./access-token.model";
import { LoginInterface } from "./login.interface";
import { HabitatClsModel } from "@warp-core/auth/payload/model/habitat.model";

@Injectable()
export class LoginByHabitatService implements LoginInterface {
    constructor(
        private jwtService: JwtService
    ) { }

    async login(habitat: HabitatClsModel): Promise<AccessToken> {
        const payload = {
            dbModel: habitat,
            sub: habitat.userId,
            localId: habitat.id,
        } as PayloadInterface;

        return {
            access_token: `Bearer ${this.jwtService.sign(payload)}`,
        } as AccessToken;
    }
}