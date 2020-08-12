import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DiscordModuleAsyncOptions } from './interface/discord-module-async-options';
import { DiscordOptionsFactory } from './interface/discord-options-factory';
import { DiscordService } from './discord.service';
import { DiscordModuleOption } from './interface/discord-module-option';
import { DISCORD_MODULE_OPTIONS } from './constant/discord.constant';
import { Client } from 'discord.js';

@Module({
  imports: [DiscoveryModule],
  providers: [DiscordService],
  exports: [DiscordService]
})
export class DiscordModule {
  static forRoot(options: DiscordModuleOption): DynamicModule {
    return {
      module: DiscordModule,
      providers: DiscordModule.createDiscordProvider(options),
      exports: [Client]
    };
  }

  static forRootAsync(options: DiscordModuleAsyncOptions): DynamicModule {
    return {
      module: DiscordModule,
      imports: options.imports || [],
      providers: DiscordModule.createAsyncProvider(options),
      exports: [Client]
    };
  }

  private static createDiscordProvider(
    options: DiscordModuleOption,
  ): Provider[] {
    return [
      {
        provide: DISCORD_MODULE_OPTIONS,
        useValue: options || {},
      },
      {
        provide: Client,
        useValue: new Client(options)
      },
      DiscordService
    ];
  }

  private static createAsyncProvider(
    options: DiscordModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: DiscordModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: DISCORD_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: DISCORD_MODULE_OPTIONS,
      useFactory: async (optionsFactory: DiscordOptionsFactory): Promise<DiscordModuleOption> =>
        await optionsFactory.createTelegramOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
