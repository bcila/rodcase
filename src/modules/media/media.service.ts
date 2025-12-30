import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as fs from 'fs';
import { Media } from './schema/media.schema';
import { User } from '../users/schema/user.schema';

@Injectable()
export class MediaService {
  constructor(@InjectModel(Media.name) private mediaModel: Model<Media>) {}

  async upload(file: Express.Multer.File, user: User) {
    if (!file) throw new BadRequestException('No file uploaded');

    return await this.mediaModel.create({
      ownerId: user._id,
      fileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
    });
  }

  async getMyMedia(user: User) {
    return this.mediaModel.find({ ownerId: user._id });
  }

  async getMediaById(id: string, user: User) {
    const media = await this.findMedia(id);
    this.checkAccess(media, user);
    return media;
  }

  async download(id: string, user: User): Promise<string> {
    const media = await this.findMedia(id);
    this.checkAccess(media, user);
    return media.filePath;
  }

  async delete(id: string, user: User) {
    const media = await this.findMedia(id);
    if (!media.ownerId.equals(user._id)) throw new ForbiddenException();
    fs.unlinkSync(media.filePath);
    await media.deleteOne();
    return { message: 'Deleted' };
  }

  async getPermissions(id: string, user: User) {
    const media = await this.findMedia(id);
    if (!media.ownerId.equals(user._id)) throw new ForbiddenException();
    return media.allowedUserIds;
  }

  async updatePermissions(
    id: string,
    userId: string,
    action: 'add' | 'remove',
    user: User,
  ) {
    const media = await this.findMedia(id);
    if (!media.ownerId.equals(user._id)) throw new ForbiddenException();
    const targetId = new Types.ObjectId(userId);
    if (action === 'add') {
      if (!media.allowedUserIds.some((uid) => uid.equals(targetId))) {
        media.allowedUserIds.push(targetId);
      }
    } else if (action === 'remove') {
      media.allowedUserIds = media.allowedUserIds.filter(
        (uid) => !uid.equals(targetId),
      );
    }
    await media.save();
    return media.allowedUserIds;
  }

  private async findMedia(id: string) {
    const media = await this.mediaModel.findById(id);
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  private checkAccess(media: Media, user: User) {
    if (
      !media.ownerId.equals(user._id) &&
      !media.allowedUserIds.some((uid) => uid.equals(user._id))
    ) {
      throw new ForbiddenException('Access denied');
    }
  }
}
