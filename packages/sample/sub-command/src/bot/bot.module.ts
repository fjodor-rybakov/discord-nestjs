import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';

import { RegistrationCommand } from './commands/registration.command';
import { BaseInfoSubCommand } from './commands/sub-commands/base-info-sub-command';
import { EmailSubCommand } from './commands/sub-commands/email-sub-command';
import { NumberSubCommand } from './commands/sub-commands/number-sub-command';

@Module({
  imports: [DiscordModule.forFeature()],
  providers: [
    RegistrationCommand,
    BaseInfoSubCommand,
    EmailSubCommand,
    NumberSubCommand,
  ],
})
export class BotModule {}
