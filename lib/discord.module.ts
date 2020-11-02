import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DiscordModuleAsyncOptions } from './interface/discord-module-async-options';
import { DiscordOptionsFactory } from './interface/discord-options-factory';
import { DiscordService } from './service/discord.service';
import { DiscordModuleOption } from './interface/discord-module-option';
import { DISCORD_MODULE_OPTIONS } from './constant/discord.constant';
import { DiscordClient } from './discord-client';
import { DiscordMiddlewareService } from './service/discord-middleware.service';
import { OnResolver } from './resolver/on.resolver';
import { OnCommandResolver } from './resolver/on-command.resolver';
import { OnceResolver } from './resolver/once.resolver';
import { DiscordInterceptorService } from './service/discord-interceptor.service';
import { DiscordGuardService } from './service/discord-guard.service';

@Module({
  imports: [DiscoveryModule],
})
export class DiscordModule {
  static forRoot(options: DiscordModuleOption): DynamicModule {
    return {
      module: DiscordModule,
      providers: [
        DiscordMiddlewareService,
        DiscordGuardService,
        DiscordInterceptorService,
        OnResolver,
        OnCommandResolver,
        OnceResolver,
        DiscordService,
        ...DiscordModule.createDiscordProvider(options),
      ],
      exports: [DiscordClient],
    };
  }

  static forRootAsync(options: DiscordModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: DiscordClient,
      useFactory: async (
        discordModuleOption: DiscordModuleOption,
      ): Promise<DiscordClient> => {
        return new DiscordClient(discordModuleOption);
      },
      inject: [DISCORD_MODULE_OPTIONS],
    };
    return {
      module: DiscordModule,
      imports: options.imports || [],
      providers: [
        DiscordMiddlewareService,
        DiscordGuardService,
        DiscordInterceptorService,
        OnResolver,
        OnCommandResolver,
        OnceResolver,
        DiscordService,
        this.createConfigAsyncProviders(options),
        connectionProvider,
      ],
      exports: [DiscordClient],
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
        provide: DiscordClient,
        useValue: new DiscordClient(options),
      },
      DiscordService,
    ];
  }

  private static createConfigAsyncProviders(
    options: DiscordModuleAsyncOptions,
  ): Provider {
    if (options) {
      if (options.useFactory) {
        return {
          provide: DISCORD_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        };
      } else {
        // For useClass and useExisting...
        return {
          provide: DISCORD_MODULE_OPTIONS,
          useFactory: async (
            optionsFactory: DiscordOptionsFactory,
          ): Promise<DiscordModuleOption> =>
            await optionsFactory.createDiscordOptions(),
          inject: [options.useExisting || options.useClass],
        };
      }
    } else {
      return {
        provide: DISCORD_MODULE_OPTIONS,
        useValue: {},
      };
    }
  }
}
