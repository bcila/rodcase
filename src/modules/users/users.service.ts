import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { User } from './schema/user.schema';
import { QueryFilter, Model, UpdateQuery } from 'mongoose';
import { CreateUserRequest } from './dto/create-user.request';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(data: CreateUserRequest) {
    const { email } = data;
    const existing = await this.userModel.findOne({ email: email });
    if (existing) throw new ConflictException('User already exists');

    await new this.userModel({
      ...data,
      password: await hash(data.password, 10),
    }).save();
  }

  async getUser(query: QueryFilter<User>) {
    const user = await this.userModel.findOne(query);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUsers() {
    return this.userModel.find({});
  }

  async updateUser(query: QueryFilter<User>, data: UpdateQuery<User>) {
    return this.userModel.findOneAndUpdate(query, data);
  }
}
