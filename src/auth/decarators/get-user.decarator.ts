import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface JwtPayloadUser {
  sub: number;
  email: string;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayloadUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: JwtPayloadUser }>();
    return request.user;
  },
);
