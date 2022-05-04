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
import { CollectorExplorer } from './explorers/collector/collector.explorer';
import { CommandExplorer } from './explorers/command/command.explorer';
import { EventExplorer } from './explorers/event/event.explorer';
import { FilterExplorer } from './explorers/filter/filter.explorer';
import { GuardExplorer } from './explorers/guard/guard.explorer';
import { MiddlewareExplorer } from './explorers/middleware/middleware.explorer';
import { OptionExplorer } from './explorers/option/option.explorer';
import { ParamExplorer } from './explorers/param/param.explorer';
import { PipeExplorer } from './explorers/pipe/pipe.explorer';
import { PrefixCommandExplorer } from './explorers/prefix-command/prefix-command.explorer';
import { DiscordClientProvider } from './providers/discord-client.provider';
import { DiscordCommandProvider } from './providers/discord-command.provider';
import { ReflectMetadataProvider } from './providers/reflect-metadata.provider';
import { BuildApplicationCommandService } from './services/build-application-command.service';
import { ClientService } from './services/client.service';
import { CommandTreeService } from './services/command-tree.service';
import { DtoService } from './services/dto.service';
import { ExplorerService } from './services/explorer.service';
import { InstantiationService } from './services/instantiation.service';
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
        InstantiationService,
        RegisterCommandService,
        OptionExplorer,
        FilterExplorer,
        MiddlewareExplorer,
        PipeExplorer,
        GuardExplorer,
        ParamExplorer,
        CommandExplorer,
        PrefixCommandExplorer,
        DtoService,
        EventExplorer,
        ExplorerService,
        BuildApplicationCommandService,
        CommandTreeService,
        CollectorExplorer,
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
          useFactory: () => firstValueFrom(DiscordModule.initSubject), // Should only be called after DiscordClientService init
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
          discordClientService: ClientService,
          discordClientProvider: DiscordClientProvider,
          discordModuleOptions: DiscordModuleOption,
        ) => {
          discordClientService.init(discordModuleOptions);

          DiscordModule.initSubject.next(discordClientService.getClient());

          return discordClientProvider;
        },
        inject: [
          ClientService,
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
