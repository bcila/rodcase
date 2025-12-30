import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiBody,
  ApiOperation,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/schema/user.schema';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

@ApiTags('media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
    return this.mediaService.upload(file, user);
  }

  @Get('my')
  getMy(@CurrentUser() user: User) {
    return this.mediaService.getMyMedia(user);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentUser() user: User) {
    return this.mediaService.getMediaById(id, user);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const filePath = await this.mediaService.download(id, user);
    res.download(filePath); // Or stream: res.sendFile(filePath);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.mediaService.delete(id, user);
  }

  @Get(':id/permissions')
  getPermissions(@Param('id') id: string, @CurrentUser() user: User) {
    return this.mediaService.getPermissions(id, user);
  }

  @ApiOperation({
    summary: 'Grant or revoke media access for a user',
  })
  @ApiBody({ type: UpdatePermissionsDto })
  @Post(':id/permissions')
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionsDto,
    @CurrentUser() user: User,
  ) {
    return this.mediaService.updatePermissions(
      id,
      dto.userId,
      dto.action,
      user,
    );
  }
}
