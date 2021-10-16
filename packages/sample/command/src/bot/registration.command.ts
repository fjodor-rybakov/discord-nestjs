import { Command, UseGroup } from '@discord-nestjs/core';
import { NumberSubCommand } from './number-sub-command';
import { EmailSubCommand } from './email-sub-command';
import { BaseInfoSubCommand } from './base-info-sub-command';

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
