import { AuthModelInterface } from "./auth-model.interface";

export interface PayloadInterface {
    /**
     * UserId of already logged in user
     */
    sub: number;

    /**
     * Entity loaded from DB connected to currently logged in user
     */
    dbModel: AuthModelInterface;
}