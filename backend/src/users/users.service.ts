import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  async userExists(id: string): Promise<User | null> {
    const objectId = new ObjectId(id);
    return await this.userRepo.findOneBy({ _id: objectId } as any);
  }
}
