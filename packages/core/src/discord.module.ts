import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DiscordClientProvider } from './providers/discord-client.provider';
import { DiscordModuleOption } from './definitions/interfaces/discord-module-options';
import { DiscordModuleAsyncOptions } from './definitions/interfaces/discord-module-async-options';
import { DISCORD_MODULE_OPTIONS } from './definitions/constants/discord-module.contant';
import { DiscordOptionsFactory } from './definitions/interfaces/discord-options-factory';
import { DiscordResolverService } from './services/discord-resolver.service';
import { DiscordOptionService } from './services/discord-option.service';
import { DiscordClientService } from './services/discord-client.service';
import { EventResolver } from './resolvers/event/event.resolver';
import { GuardResolver } from './resolvers/guard/guard.resolver';
import { MiddlewareResolver } from './resolvers/middleware/middleware.resolver';
import { PipeResolver } from './resolvers/pipe/pipe.resolver';
import { GuardClassResolver } from './resolvers/guard/guard-class.resolver';
import { PipeClassResolver } from './resolvers/pipe/pipe-class.resolver';
import { ReflectMetadataProvider } from './providers/reflect-metadata.provider';
import { CommandResolver } from './resolvers/command/command.resolver';
import { DiscordCommandStore } from './store/discord-command-store';

@Module({
  imports: [DiscoveryModule],
})
export class DiscordModule {
  static forRoot(options: DiscordModuleOption): DynamicModule {
    return {
      module: DiscordModule,
      providers: [
        DiscordCommandStore,
        ReflectMetadataProvider,
        MiddlewareResolver,
        PipeResolver,
        GuardResolver,
        GuardClassResolver,
        PipeClassResolver,
        CommandResolver,
        EventResolver,
        DiscordResolverService,
        DiscordModule.createDiscordOptionProvider(options),
        DiscordClientProvider,
        DiscordResolverService,
        DiscordOptionService,
        DiscordClientService,
      ],
      exports: [DiscordClientProvider],
    };
  }

  static forRootAsync(options: DiscordModuleAsyncOptions): DynamicModule {
    return {
      module: DiscordModule,
      imports: options.imports || [],
      providers: [
        DiscordCommandStore,
        ReflectMetadataProvider,
        MiddlewareResolver,
        PipeResolver,
        GuardResolver,
        GuardClassResolver,
        PipeClassResolver,
        CommandResolver,
        EventResolver,
        DiscordResolverService,
        ...DiscordModule.createAsyncDiscordOptionProviders(options),
        DiscordClientProvider,
        DiscordResolverService,
        DiscordOptionService,
        DiscordClientService,
      ],
      exports: [DiscordClientProvider],
    };
  }

  private static createDiscordOptionProvider(
    options: DiscordModuleOption,
  ): Provider {
    return {
      provide: DISCORD_MODULE_OPTIONS,
      useValue: options || {},
    };
  }

  private static createAsyncDiscordOptionProviders(
    options: DiscordModuleAsyncOptions,
  ): Provider[] {
    if (options) {
      if (options.useFactory) {
        return [
          {
            provide: DISCORD_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject || [],
          },
        ];
      } else {
        // For useClass and useExisting...
        const useClass = options.useClass as Type<DiscordOptionsFactory>;
        const providers: Provider[] = [
          {
            provide: DISCORD_MODULE_OPTIONS,
            useFactory: async (
              optionsFactory: DiscordOptionsFactory,
            ): Promise<DiscordModuleOption> =>
              optionsFactory.createDiscordOptions(),
            inject: [options.useExisting || options.useClass],
          },
        ];
        if (useClass) {
          providers.push({
            provide: useClass,
            useClass,
          });
        }
        return providers;
      }
    } else {
      return [
        {
          provide: DISCORD_MODULE_OPTIONS,
          useValue: {},
        },
      ];
    }
  }
}
