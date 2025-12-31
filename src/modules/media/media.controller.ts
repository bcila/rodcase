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
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
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
@ApiUnauthorizedResponse({
  example: {
    description: 'Unauthorized',
    statusCode: 401,
  },
})
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a media' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiBadRequestResponse({
    example: {
      message: 'No file uploaded',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
    return this.mediaService.upload(file, user);
  }

  @Get('my')
  @ApiOperation({
    summary: 'Get my media',
    description: 'Returns all media uploaded by the current user',
  })
  @ApiOkResponse({
    description: 'List of user media',
  })
  getMy(@CurrentUser() user: User) {
    return this.mediaService.getMyMedia(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by id' })
  @ApiOkResponse({
    description: 'Media found',
  })
  @ApiForbiddenResponse({
    description: 'User does not have access to this media',
  })
  @ApiNotFoundResponse({
    description: 'Media not found',
  })
  get(@Param('id') id: string, @CurrentUser() user: User) {
    return this.mediaService.getMediaById(id, user);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'Download media',
    description: 'Downloads the media file. Returns file stream, not JSON.',
  })
  @ApiOkResponse({
    description: 'File download',
    content: {
      'application/octet-stream': {},
    },
  })
  @ApiForbiddenResponse({
    description: 'No access to this media',
  })
  @ApiNotFoundResponse({
    description: 'Media not found',
  })
  async download(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const filePath = await this.mediaService.download(id, user);
    res.sendFile(filePath);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  @ApiOkResponse({
    description: 'Media deleted successfully',
  })
  @ApiForbiddenResponse({
    description: 'Only owner can delete media',
  })
  @ApiNotFoundResponse({
    description: 'Media not found',
  })
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.mediaService.delete(id, user);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get permissions by id' })
  @ApiOkResponse({
    description: 'Permissions list',
  })
  @ApiForbiddenResponse({
    description: 'Only owner can view permissions',
  })
  getPermissions(@Param('id') id: string, @CurrentUser() user: User) {
    return this.mediaService.getPermissions(id, user);
  }

  @ApiOperation({
    summary: 'Grant or revoke media access for a user',
  })
  @ApiBody({ type: UpdatePermissionsDto })
  @ApiOkResponse({
    description: 'Permissions updated successfully',
  })
  @ApiForbiddenResponse({
    description: 'Only owner can update permissions',
  })
  @ApiBadRequestResponse({
    description: 'Invalid action or userId',
  })
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
