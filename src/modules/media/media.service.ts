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

  // Handle file upload
  async upload(file: Express.Multer.File, user: User) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Save file metadata to database
    return await this.mediaModel.create({
      ownerId: user._id,
      fileName: file.originalname,
      filePath: file.path,
      mimeType: file.mimetype,
      size: file.size,
    });
  }

  // Get all media owned by the user
  async getMyMedia(user: User) {
    return this.mediaModel.find({ ownerId: user._id });
  }

  // Get media by ID and check access
  async getMediaById(id: string, user: User) {
    const media = await this.findMedia(id);
    this.checkAccess(media, user);
    return media;
  }

  // Return file path for downloading media
  async download(id: string, user: User): Promise<string> {
    const media = await this.findMedia(id);
    this.checkAccess(media, user);
    return media.filePath;
  }

  // Delete media (only owner can delete)
  async delete(id: string, user: User) {
    const media = await this.findMedia(id);

    // Check ownership
    if (!media.ownerId.equals(user._id)) throw new ForbiddenException();

    // Remove file from filesystem
    fs.unlinkSync(media.filePath);

    // Delete database record
    await media.deleteOne();
    return { message: 'Deleted' };
  }

  // Get users who have access to the media
  async getPermissions(id: string, user: User) {
    const media = await this.findMedia(id);
    // Only owner can view permissions
    if (!media.ownerId.equals(user._id)) throw new ForbiddenException();
    return media.allowedUserIds;
  }

  // Update media access permissions
  async updatePermissions(
    id: string,
    userId: string,
    action: 'add' | 'remove',
    user: User,
  ) {
    const media = await this.findMedia(id);

    // Only owner can update permissions
    if (!media.ownerId.equals(user._id)) throw new ForbiddenException();
    const targetId = new Types.ObjectId(userId);

    // Add user to allowed list
    if (action === 'add') {
      if (!media.allowedUserIds.some((uid) => uid.equals(targetId))) {
        media.allowedUserIds.push(targetId);
      }
      // Remove user from allowed list
    } else if (action === 'remove') {
      media.allowedUserIds = media.allowedUserIds.filter(
        (uid) => !uid.equals(targetId),
      );
    }
    await media.save();
    return media.allowedUserIds;
  }

  // Find media by ID
  private async findMedia(id: string) {
    const media = await this.mediaModel.findById(id);
    if (!media) throw new NotFoundException('Media not found');
    return media;
  }

  // Check whether user has access to the media
  private checkAccess(media: Media, user: User) {
    if (
      !media.ownerId.equals(user._id) &&
      !media.allowedUserIds.some((uid) => uid.equals(user._id))
    ) {
      throw new ForbiddenException('Access denied');
    }
  }
}
