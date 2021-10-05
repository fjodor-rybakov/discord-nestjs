import { Test } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { Intents } from 'discord.js';
import { DiscordModule, DiscordClientProvider } from '../../src';

describe('Discord module', () => {
  it('define should be success registered discord client', async () => {
    await new Promise(async (resolve) => {
      @Module({
        imports: [
          ConfigModule.forRoot({
            envFilePath: 'test/base/.test.env',
          }),
          DiscordModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
              token: configService.get('TOKEN'),
              discordClientOptions: {
                intents: [Intents.FLAGS.GUILDS],
              },
            }),
            inject: [ConfigService],
          }),
        ],
      })
      class CommandBotModule {}

      const moduleRef = await Test.createTestingModule({
        imports: [CommandBotModule],
      }).compile();

      const client = moduleRef.get(DiscordClientProvider).getClient();

      client.on('ready', async () => {
        await moduleRef.close();
        resolve({});
      });

      await moduleRef.init();
    });
  });
});
