import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DiscordModuleAsyncOptions } from './interface/discord-module-async-options';
import { DiscordOptionsFactory } from './interface/discord-options-factory';
import { ModuleConstant } from './constant/module.constant';
import { DiscordClientProvider } from './provider/discord-client-provider';
import { DiscordService } from './service/discord.service';
import { DiscordModuleOption } from './interface/discord-module-option';
import { ReflectMetadataProvider } from './provider/reflect-metadata.provider';
import { DiscordHandlerService } from './service/discord-handler.service';
import { DiscordAccessService } from './service/discord-access.service';
import { GuardResolver } from './resolver/guard.resolver';
import { OnCommandResolver } from './resolver/on-command.resolver';
import { DiscordResolverService } from './service/discord-resolver.service';
import { MiddlewareResolver } from './resolver/middleware.resolver';
import { PipeResolver } from './resolver/pipe.resolver';
import { ParamResolver } from './resolver/param.resolver';
import { OnEventResolver } from './resolver/on-event.resolver';
import { OnceEventResolver } from './resolver/once-event.resolver';
import { ClientResolver } from './resolver/client.resolver';
import { TransformProvider } from './provider/transform.provider';

@Module({
  imports: [DiscoveryModule],
})
export class DiscordModule {
  static forRoot(options: DiscordModuleOption): DynamicModule {
    return {
      module: DiscordModule,
      providers: [
        MiddlewareResolver,
        GuardResolver,
        PipeResolver,
        ParamResolver,
        OnEventResolver,
        OnceEventResolver,
        OnCommandResolver,
        ReflectMetadataProvider,
        DiscordHandlerService,
        DiscordAccessService,
        ...DiscordModule.createDiscordProvider(options),
        DiscordClientProvider,
        DiscordResolverService,
        ClientResolver,
        TransformProvider
      ],
      exports: [DiscordClientProvider, TransformProvider],
    };
  }

  static forRootAsync(options: DiscordModuleAsyncOptions): DynamicModule {
    const connectionProvider = {
      provide: DiscordService,
      useFactory: (discordModuleOption: DiscordModuleOption) => {
        return new DiscordService(discordModuleOption);
      },
      inject: [ModuleConstant.DISCORD_MODULE_OPTIONS],
    };
    return {
      module: DiscordModule,
      imports: options.imports || [],
      providers: [
        MiddlewareResolver,
        GuardResolver,
        PipeResolver,
        ParamResolver,
        OnEventResolver,
        OnceEventResolver,
        OnCommandResolver,
        ReflectMetadataProvider,
        DiscordHandlerService,
        DiscordAccessService,
        this.createConfigAsyncProviders(options),
        DiscordClientProvider,
        DiscordResolverService,
        connectionProvider,
        ClientResolver,
        TransformProvider
      ],
      exports: [DiscordClientProvider, TransformProvider],
    };
  }

  private static createDiscordProvider(
    options: DiscordModuleOption,
  ): Provider[] {
    return [
      {
        provide: ModuleConstant.DISCORD_MODULE_OPTIONS,
        useValue: options || {},
      },
      {
        provide: DiscordService,
        useFactory: (discordModuleOption: DiscordModuleOption) => {
          return new DiscordService(discordModuleOption);
        },
        inject: [ModuleConstant.DISCORD_MODULE_OPTIONS],
      },
    ];
  }

  private static createConfigAsyncProviders(
    options: DiscordModuleAsyncOptions,
  ): Provider {
    if (options) {
      if (options.useFactory) {
        return {
          provide: ModuleConstant.DISCORD_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        };
      } else {
        // For useClass and useExisting...
        return {
          provide: ModuleConstant.DISCORD_MODULE_OPTIONS,
          useFactory: async (
            optionsFactory: DiscordOptionsFactory,
          ): Promise<DiscordModuleOption> =>
            await optionsFactory.createDiscordOptions(),
          inject: [options.useExisting || options.useClass],
        };
      }
    } else {
      return {
        provide: ModuleConstant.DISCORD_MODULE_OPTIONS,
        useValue: {},
      };
    }
  }
}
