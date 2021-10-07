import { Command, UseGroup } from '@discord-nestjs/core';
import { NumberSubCommand } from './number-sub-command';
import { EmailSubCommand } from './email-sub-command';

@Command({
  name: 'reg',
  description: 'User registration',
  include: [
    UseGroup(
      { name: 'type', description: 'Registration type' },
      NumberSubCommand,
      EmailSubCommand,
    ),
  ],
})
export class RegistrationCommand {}
