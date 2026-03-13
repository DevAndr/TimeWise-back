import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ApiToken } from '@prisma/client';

export const CurrentApiToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ApiToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.apiToken;
  },
);
