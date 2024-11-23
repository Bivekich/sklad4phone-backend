import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './log.entity';
import { UserService } from '../user/user.service'; // Import UserService

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    private readonly userService: UserService, // Inject UserService
  ) {}

  async createLogByApi(phoneNumber: string, action: string): Promise<Log> {
    const user = await this.userService.getUserByPhoneNumber(phoneNumber);
    const log = this.logRepository.create({ user_id: user.id, action });
    return this.logRepository.save(log);
  }

  async createLog(userId: number, action: string): Promise<Log> {
    const log = this.logRepository.create({ user_id: userId, action });
    return this.logRepository.save(log);
  }

  async findAllLogs(): Promise<Log[]> {
    return this.logRepository.find();
  }

  async getLogByUserId(user_id: number): Promise<Log[]> {
    return this.logRepository.find({ where: { user_id } });
  }
}
