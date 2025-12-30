import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsEnum } from 'class-validator';

enum PermissionAction {
  ADD = 'add',
  REMOVE = 'remove',
}

export class UpdatePermissionsDto {
  @ApiProperty({
    description: 'Target user id',
    example: '665f1c2e9d8e4a0012345678',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    enum: PermissionAction,
    description: 'Permission action',
  })
  @IsEnum(PermissionAction)
  action: PermissionAction;
}
