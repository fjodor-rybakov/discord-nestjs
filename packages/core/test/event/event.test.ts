import { Module, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Guild, Intents, Message } from 'discord.js';
import { Test, TestingModule } from '@nestjs/testing';
import { Once, DiscordModule, On, DiscordClientProvider } from '../../src';

describe('Event decorator', () => {
  let moduleRef: TestingModule;

  it('define should be success registered', async () => {
    await new Promise(async (resolve) => {
      @Injectable()
      class BotGateway {
        @Once('ready')
        async onReady() {
          await moduleRef.close();
          resolve({});
        }
      }

      @Module({
        imports: [
          ConfigModule.forRoot({
            envFilePath: 'test/event/.test.env',
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
        providers: [BotGateway],
      })
      class CommandBotModule {}

      moduleRef = await Test.createTestingModule({
        imports: [CommandBotModule],
      }).compile();

      await moduleRef.init();
    });
  });

  it.skip('define should be success registered discord client', async () => {
    const testingGuildName = 'test';
    const testChannelName = 'test-text-channel';
    const messageText = 'Some important text';
    let moduleRef: TestingModule;
    let guild: Guild;

    await new Promise(async (resolve, reject) => {
      @Injectable()
      class BotGateway {
        constructor(private readonly discordProvider: DiscordClientProvider) {}

        @Once('ready')
        async onReady() {
          guild = await this.discordProvider
            .getClient()
            .guilds.create(testingGuildName);
          const channel = await guild.channels.create(testChannelName, {
            type: 'GUILD_TEXT',
          });
          channel.send(messageText);
        }

        @On('message')
        async onMessage(message: Message) {
          await guild.delete();
          await moduleRef.close();
          try {
            expect(message.content).toStrictEqual(messageText);
            return resolve({});
          } catch (err) {
            return reject(err);
          }
        }
      }

      @Module({
        imports: [
          ConfigModule.forRoot({
            envFilePath: 'test/event/.test.env',
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
        providers: [BotGateway],
      })
      class CommandBotModule {}

      moduleRef = await Test.createTestingModule({
        imports: [CommandBotModule],
      }).compile();

      await moduleRef.init();
    });
  });
});
