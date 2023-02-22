import { DynamicModule, Module, Provider, Scope, Type } from '@nestjs/common';
import { DiscoveryModule, REQUEST } from '@nestjs/core';
import { Subject, firstValueFrom } from 'rxjs';

import { INJECT_DISCORD_CLIENT } from './decorators/client/inject-discord-client.constant';
import { COLLECTOR_EXPLORER_ALIAS } from './definitions/constants/collector-explorer-alias';
import { DISCORD_CLIENT_PROVIDER_ALIAS } from './definitions/constants/discord-client-provider-alias';
import { DISCORD_COLLECTOR_PROVIDER_ALIAS } from './definitions/constants/discord-collector-provider-alias';
import { DISCORD_COMMAND_PROVIDER_ALIAS } from './definitions/constants/discord-command-provider-alias';
import { DISCORD_MODULE_OPTIONS } from './definitions/constants/discord-module.contant';
import { REFLECT_METADATA_PROVIDER_ALIAS } from './definitions/constants/reflect-metadata-provider-alias';
import { DiscordModuleAsyncOptions } from './definitions/interfaces/discord-module-async-options';
import { DiscordModuleOption } from './definitions/interfaces/discord-module-options';
import { DiscordOptionsFactory } from './definitions/interfaces/discord-options-factory';
import { RequestPayload } from './definitions/interfaces/request-payload';
import { DiscordHostModule } from './discord-host.module';
import { CollectorRegister } from './explorers/collector/collector-register';
import { CollectorExplorer } from './explorers/collector/collector.explorer';
import { InteractionCollectorStrategy } from './explorers/collector/strategy/interaction-collector.strategy';
import { MessageCollectorStrategy } from './explorers/collector/strategy/message-collector.strategy';
import { ReactCollectorStrategy } from './explorers/collector/strategy/react-collector.strategy';
import { CommandExplorer } from './explorers/command/command.explorer';
import { EventExplorer } from './explorers/event/event.explorer';
import { OptionExplorer } from './explorers/option/option.explorer';
import { CollectorProvider } from './providers/collector.provider';
import { CAUSE_EVENT } from './providers/constants/cause-event.constant';
import { COLLECTOR } from './providers/constants/collector.constant';
import { DiscordClientProvider } from './providers/discord-client.provider';
import { DiscordCommandProvider } from './providers/discord-command.provider';
import { ReflectMetadataProvider } from './providers/reflect-metadata.provider';
import { BuildApplicationCommandService } from './services/build-application-command.service';
import { ClientService } from './services/client.service';
import { CommandHandlerFinderService } from './services/command-handler-finder.service';
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
        ...DiscordModule.createExportedForRootProviders(options),
        InstantiationService,
        RegisterCommandService,
        OptionExplorer,
        CommandExplorer,
        DtoService,
        EventExplorer,
        ExplorerService,
        CommandHandlerFinderService,
        BuildApplicationCommandService,
        ReactCollectorStrategy,
        MessageCollectorStrategy,
        InteractionCollectorStrategy,
        CollectorRegister,
        ...DiscordModule.createRequestProvides(),
      ],
      exports: [
        CollectorProvider,
        DiscordClientProvider,
        ReflectMetadataProvider,
        DiscordCommandProvider,
        INJECT_DISCORD_CLIENT,
        COLLECTOR,
        CAUSE_EVENT,
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
          provide: CollectorExplorer,
          useExisting: COLLECTOR_EXPLORER_ALIAS,
        },
        {
          provide: DiscordCommandProvider,
          useExisting: DISCORD_COMMAND_PROVIDER_ALIAS,
        },
        {
          provide: CollectorProvider,
          useExisting: DISCORD_COLLECTOR_PROVIDER_ALIAS,
        },
        ...DiscordModule.createRequestProvides(),
      ],
      exports: [
        CollectorProvider,
        DiscordClientProvider,
        ReflectMetadataProvider,
        DiscordCommandProvider,
        INJECT_DISCORD_CLIENT,
        COLLECTOR,
        CAUSE_EVENT,
      ],
    };
  }

  private static createExportedForRootProviders(
    options: DiscordModuleAsyncOptions,
  ): Provider[] {
    return [
      {
        provide: DiscordClientProvider,
        useFactory: async (
          discordClientService: ClientService,
          discordClientProvider: DiscordClientProvider,
          discordModuleOptions: DiscordModuleOption,
        ) => {
          discordClientService.initClient(discordModuleOptions);
          await discordClientService.setupClient(options.setupClientFactory);

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
        provide: DiscordCommandProvider,
        useExisting: DISCORD_COMMAND_PROVIDER_ALIAS,
      },
      {
        provide: CollectorExplorer,
        useExisting: COLLECTOR_EXPLORER_ALIAS,
      },
      {
        provide: CollectorProvider,
        useExisting: DISCORD_COLLECTOR_PROVIDER_ALIAS,
      },
      {
        provide: INJECT_DISCORD_CLIENT,
        useFactory: (discordClientProvider: DiscordClientProvider) =>
          discordClientProvider.getClient(),
        inject: [DiscordClientProvider],
      },
      ReflectMetadataProvider,
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

  private static createRequestProvides(): Provider[] {
    return [
      {
        provide: COLLECTOR,
        useFactory: ({ collector }: RequestPayload) => collector,
        inject: [REQUEST],
        scope: Scope.REQUEST,
      },
      {
        provide: CAUSE_EVENT,
        useFactory: ({ causeEvent }: RequestPayload) => causeEvent,
        inject: [REQUEST],
        scope: Scope.REQUEST,
      },
    ];
  }
}
