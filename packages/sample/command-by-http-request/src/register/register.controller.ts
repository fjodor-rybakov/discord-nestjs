import { Controller, Inject, Post } from '@nestjs/common';
import { Subject } from 'rxjs';

import { REGISTER_COMMAND_SUBJECT } from './register.constant';

@Controller()
export class BotController {
  constructor(
    @Inject(REGISTER_COMMAND_SUBJECT)
    private readonly registerCommandSubject: Subject<any>,
  ) {}

  @Post('register')
  register() {
    this.registerCommandSubject.next(true);
  }
}
