import { Module } from '@nestjs/common';
import { Subject } from 'rxjs';

import { REGISTER_COMMAND_SUBJECT } from './register.constant';
import { BotController } from './register.controller';

@Module({
  controllers: [BotController],
  providers: [{ provide: REGISTER_COMMAND_SUBJECT, useValue: new Subject() }],
  exports: [REGISTER_COMMAND_SUBJECT],
})
export class RegisterModule {}
