import { IsEmail, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserRequest {
  @IsEmail()
  @ApiProperty({ description: 'Email address', example: 'user@example.com' })
  email: string;

  @IsStrongPassword()
  @ApiProperty({ description: 'Password', example: 'password' })
  password: string;
}
