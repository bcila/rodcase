import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schema/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my user' })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    example: {
      email: 'user@example.com',
      role: 'user',
      createdAt: '2025-12-30T14:04:48.931Z',
    },
  })
  getMe(@CurrentUser() user: User) {
    return this.usersService.getMe(user);
  }
}
