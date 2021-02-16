import { Module } from '@nestjs/common';
import { DiscordModule } from 'discord-nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BotGateway } from './bot.gateway';

@Module({
  imports: [
    ConfigModule,
    DiscordModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        commandPrefix: configService.get('COMMAND_PREFIX')
      }),
      inject: [ConfigService]
    })
  ],
  providers: [BotGateway]
})
export class BotModule {
}