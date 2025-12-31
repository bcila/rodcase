import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from './token-payload.interface';
import { Request } from 'express';

// Retrieves current user from ExecutionContext
const getCurrentUserByContext = (context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  // Return user object attached to request
  return request.user as TokenPayload;
};

// Custom decorator to access current user in controllers
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): TokenPayload =>
    getCurrentUserByContext(context),
);
