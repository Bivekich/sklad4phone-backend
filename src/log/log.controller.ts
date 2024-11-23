import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LogService } from './log.service';
import { Log } from './log.entity';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  async createLog(
    @Body('phoneNumber') phoneNumber: string,
    @Body('action') action: string,
  ): Promise<Log> {
    return this.logService.createLogByApi(phoneNumber, action);
  }

  @Get()
  async getAllLogs(): Promise<Log[]> {
    return this.logService.findAllLogs();
  }

  @Get(':id')
  async getLogByUserId(@Param('id') id: number): Promise<Log[]> {
    return this.logService.getLogByUserId(id);
  }
}
