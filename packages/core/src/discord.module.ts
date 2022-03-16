import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Subject, firstValueFrom } from 'rxjs';

import { INJECT_DISCORD_CLIENT } from './decorators/client/inject-discord-client.constant';
import { DISCORD_CLIENT_PROVIDER_ALIAS } from './definitions/constants/discord-client-provider-alias';
import { DISCORD_COMMAND_PROVIDER_ALIAS } from './definitions/constants/discord-command-provider-alias';
import { DISCORD_MODULE_OPTIONS } from './definitions/constants/discord-module.contant';
import { REFLECT_METADATA_PROVIDER_ALIAS } from './definitions/constants/reflect-metadata-provider-alias';
import { DiscordModuleAsyncOptions } from './definitions/interfaces/discord-module-async-options';
import { DiscordModuleOption } from './definitions/interfaces/discord-module-options';
import { DiscordOptionsFactory } from './definitions/interfaces/discord-options-factory';
import { DiscordHostModule } from './discord-host.module';
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
import { PrefixCommandResolver } from './resolvers/prefix-command/prefix-command.resolver';
import { BuildApplicationCommandService } from './services/build-application-command.service';
import { CommandTreeService } from './services/command-tree.service';
import { DiscordClientService } from './services/discord-client.service';
import { DiscordResolverService } from './services/discord-resolver.service';
import { DtoService } from './services/dto.service';
import { RegisterCommandService } from './services/register-command.service';

@Module({
  imports: [DiscordHostModule, DiscoveryModule],
})
export class DiscordModule {
  private static initSubject = new Subject();

  static forRootAsync(options: DiscordModuleAsyncOptions): DynamicModule {
    return {
      module: DiscordModule,
      imports: options.imports || [],
      providers: [
        ...DiscordModule.createAsyncDiscordOptionProviders(options),
        ...DiscordModule.createExportedForRootProviders(),
        RegisterCommandService,
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
        PrefixCommandResolver,
        DtoService,
        EventResolver,
        DiscordResolverService,
        BuildApplicationCommandService,
        CommandTreeService,
        BaseCollectorResolver,
        CollectorClassResolver,
        CollectorResolver,
      ],
      exports: [
        DiscordClientProvider,
        ReflectMetadataProvider,
        DiscordCommandProvider,
        INJECT_DISCORD_CLIENT,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: DiscordModule,
      providers: [
        {
          provide: INJECT_DISCORD_CLIENT,
          useFactory: () => firstValueFrom(DiscordModule.initSubject),
        },
        {
          provide: DiscordClientProvider,
          useExisting: DISCORD_CLIENT_PROVIDER_ALIAS,
        },
        {
          provide: ReflectMetadataProvider,
          useExisting: REFLECT_METADATA_PROVIDER_ALIAS,
        },
        {
          provide: DiscordCommandProvider,
          useExisting: DISCORD_COMMAND_PROVIDER_ALIAS,
        },
      ],
      exports: [
        DiscordClientProvider,
        ReflectMetadataProvider,
        DiscordCommandProvider,
        INJECT_DISCORD_CLIENT,
      ],
    };
  }

  private static createExportedForRootProviders(): Provider[] {
    return [
      {
        provide: DiscordClientProvider,
        useFactory: (
          discordClientService: DiscordClientService,
          discordClientProvider: DiscordClientProvider,
          discordModuleOptions: DiscordModuleOption,
        ) => {
          discordClientService.init(discordModuleOptions);

          DiscordModule.initSubject.next(discordClientService.getClient());

          return discordClientProvider;
        },
        inject: [
          DiscordClientService,
          DISCORD_CLIENT_PROVIDER_ALIAS,
          DISCORD_MODULE_OPTIONS,
        ],
      },
      {
        provide: ReflectMetadataProvider,
        useExisting: REFLECT_METADATA_PROVIDER_ALIAS,
      },
      {
        provide: DiscordCommandProvider,
        useExisting: DISCORD_COMMAND_PROVIDER_ALIAS,
      },
      {
        provide: INJECT_DISCORD_CLIENT,
        useFactory: (discordClientProvider: DiscordClientProvider) =>
          discordClientProvider.getClient(),
        inject: [DiscordClientProvider],
      },
    ];
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
