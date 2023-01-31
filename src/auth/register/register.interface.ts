import { LoginParameters } from "../login/login-parameters.model";

export interface RegisterInterface {

    /**
     * Create new account on local game server
     *
     * @param userId New account will be created for that user id
     */
    registerUser(userId: number): Promise<LoginParameters>
}