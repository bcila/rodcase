import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from './token-payload.interface';
import { Request } from 'express';

const getCurrentUserByContext = (context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  return request.user as TokenPayload;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TokenPayload =>
    getCurrentUserByContext(context),
);
