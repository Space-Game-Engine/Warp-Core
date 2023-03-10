
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { PayloadInterface } from '@warp-core/auth/interface/payload.interface';
import { AuthModelInterface } from '@warp-core/auth/interface/auth-model.interface';

@Injectable({ scope: Scope.REQUEST })
export class PayloadDataService {

    private extractJwt: JwtFromRequestFunction;

    constructor(
        private jwtService: JwtService,
        @Inject(REQUEST) private readonly request: Request
    ) {
        this.extractJwt = ExtractJwt.fromAuthHeaderAsBearerToken(); 
    }
    
    private parseJwtPayload(): PayloadInterface {
        const parsedPayload = this.jwtService.decode(
            this.extractJwt(this.request)
        ) as PayloadInterface;

        return parsedPayload;
    }

    getUserId(): number {
        const payload = this.parseJwtPayload();

        return payload.sub;
    }

    async getModel(): Promise<AuthModelInterface> {
        const payload = this.parseJwtPayload();

        return payload.dbModel;
    }
}