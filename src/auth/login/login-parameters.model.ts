import { ApiProperty } from "@nestjs/swagger";

export class LoginParameters {
    @ApiProperty({
        type: Number,
        description: "Id of user that wants to log in"
    })
    readonly userId: number;

    @ApiProperty({
        type: Number,
        description: "Id of habitat that should be shown"
    })
    readonly habitatId: number;
}