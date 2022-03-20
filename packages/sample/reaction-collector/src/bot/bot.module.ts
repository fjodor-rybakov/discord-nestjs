import { Module } from '@nestjs/common';

import { BotGateway } from './bot.gateway';

@Module({
  providers: [BotGateway],
})
export class BotModule {}
