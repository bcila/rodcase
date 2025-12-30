import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Media extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop()
  fileName: string;

  @Prop()
  filePath: string;

  @Prop()
  mimeType: string;

  @Prop()
  size: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  allowedUserIds: Types.ObjectId[];
}

export const MediaSchema = SchemaFactory.createForClass(Media);
