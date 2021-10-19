import { BaseInfoSubCommand } from './sub-commands/base-info-sub-command';
import { EmailSubCommand } from './sub-commands/email-sub-command';
import { NumberSubCommand } from './sub-commands/number-sub-command';
import { Command, UseGroup } from '@discord-nestjs/core';

@Command({
  name: 'reg',
  description: 'User registration',
  include: [
    UseGroup(
      { name: 'type', description: 'Registration type' },
      NumberSubCommand,
      EmailSubCommand,
    ),
    BaseInfoSubCommand,
  ],
})
export class RegistrationCommand {}
