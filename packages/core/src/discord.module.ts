import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { DISCORD_MODULE_OPTIONS } from './definitions/constants/discord-module.contant';
import { DiscordModuleAsyncOptions } from './definitions/interfaces/discord-module-async-options';
import { DiscordModuleOption } from './definitions/interfaces/discord-module-options';
import { DiscordOptionsFactory } from './definitions/interfaces/discord-options-factory';
import { DiscordClientProvider } from './providers/discord-client.provider';
import { DiscordCommandProvider } from './providers/discord-command.provider';
import { ReflectMetadataProvider } from './providers/reflect-metadata.provider';
import { BaseCollectorResolver } from './resolvers/collector/base-collector.resolver';
import { CollectorClassResolver } from './resolvers/collector/collector-class.resolver';
import { CollectorResolver } from './resolvers/collector/use-collectors/collector.resolver';
import { CommandResolver } from './resolvers/command/command.resolver';
import { EventResolver } from './resolvers/event/event.resolver';
import { FilterClassResolver } from './resolvers/filter/filter-class.resolver';
import { FilterResolver } from './resolvers/filter/filter.resolver';
import { GuardClassResolver } from './resolvers/guard/guard-class.resolver';
import { GuardResolver } from './resolvers/guard/guard.resolver';
import { MiddlewareResolver } from './resolvers/middleware/middleware.resolver';
import { OptionResolver } from './resolvers/option/option.resolver';
import { ParamResolver } from './resolvers/param/param.resolver';
import { PipeClassResolver } from './resolvers/pipe/pipe-class.resolver';
import { PipeResolver } from './resolvers/pipe/pipe.resolver';
import { BuildApplicationCommandService } from './services/build-application-command.service';
import { CommandPathToClassService } from './services/command-path-to-class.service';
import { CommandTreeService } from './services/command-tree.service';
import { DiscordClientService } from './services/discord-client.service';
import { DiscordOptionService } from './services/discord-option.service';
import { DiscordResolverService } from './services/discord-resolver.service';
import { RegisterCommandService } from './services/register-command.service';

@Module({
  imports: [DiscoveryModule],
})
export class DiscordModule {
  static forRootAsync(options: DiscordModuleAsyncOptions): DynamicModule {
    const extraProviders = options.extraProviders || [];

    return {
      module: DiscordModule,
      imports: options.imports || [],
      providers: [
        CommandPathToClassService,
        RegisterCommandService,
        DiscordOptionService,
        DiscordCommandProvider,
        ReflectMetadataProvider,
        OptionResolver,
        FilterResolver,
        MiddlewareResolver,
        PipeResolver,
        GuardResolver,
        FilterClassResolver,
        GuardClassResolver,
        PipeClassResolver,
        ParamResolver,
        CommandResolver,
        EventResolver,
        DiscordResolverService,
        ...DiscordModule.createAsyncDiscordOptionProviders(options),
        DiscordClientProvider,
        DiscordResolverService,
        DiscordClientService,
        BuildApplicationCommandService,
        CommandTreeService,
        BaseCollectorResolver,
        CollectorClassResolver,
        CollectorResolver,
        ...extraProviders,
      ],
      exports: [
        DiscordClientProvider,
        ReflectMetadataProvider,
        DiscordCommandProvider,
      ],
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
