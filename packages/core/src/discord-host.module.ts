import { Module } from '@nestjs/common';
import { MetadataScanner } from '@nestjs/core';
import { DiscoveryService } from '@nestjs/core/discovery/discovery-service';

import { COLLECTOR_EXPLORER_ALIAS } from './definitions/constants/collector-explorer-alias';
import { DISCORD_CLIENT_PROVIDER_ALIAS } from './definitions/constants/discord-client-provider-alias';
import { DISCORD_COLLECTOR_PROVIDER_ALIAS } from './definitions/constants/discord-collector-provider-alias';
import { DISCORD_COMMAND_PROVIDER_ALIAS } from './definitions/constants/discord-command-provider-alias';
import { DISCORD_MODULE_OPTIONS } from './definitions/constants/discord-module.contant';
import { REFLECT_METADATA_PROVIDER_ALIAS } from './definitions/constants/reflect-metadata-provider-alias';
import { CollectorRegister } from './explorers/collector/collector-register';
import { CollectorExplorer } from './explorers/collector/collector.explorer';
import { InteractionCollectorStrategy } from './explorers/collector/strategy/interaction-collector.strategy';
import { MessageCollectorStrategy } from './explorers/collector/strategy/message-collector.strategy';
import { ReactCollectorStrategy } from './explorers/collector/strategy/react-collector.strategy';
import { CollectorProvider } from './providers/collector.provider';
import { DiscordClientProvider } from './providers/discord-client.provider';
import { DiscordCommandProvider } from './providers/discord-command.provider';
import { ReflectMetadataProvider } from './providers/reflect-metadata.provider';
import { ClientService } from './services/client.service';
import { InstantiationService } from './services/instantiation.service';
import { OptionService } from './services/option.service';

@Module({
  providers: [
    ClientService,
    OptionService,
    ReactCollectorStrategy,
    InteractionCollectorStrategy,
    MessageCollectorStrategy,
    CollectorRegister,
    InstantiationService,
    DiscoveryService,
    ReflectMetadataProvider,
    MetadataScanner,
    {
      provide: COLLECTOR_EXPLORER_ALIAS,
      useClass: CollectorExplorer,
    },
    {
      provide: REFLECT_METADATA_PROVIDER_ALIAS,
      useClass: ReflectMetadataProvider,
    },
    {
      provide: DISCORD_COMMAND_PROVIDER_ALIAS,
      useClass: DiscordCommandProvider,
    },
    {
      provide: DISCORD_CLIENT_PROVIDER_ALIAS,
      useClass: DiscordClientProvider,
    },
    {
      provide: DISCORD_MODULE_OPTIONS,
      useFactory: () => ({}),
    },
    {
      provide: DISCORD_COLLECTOR_PROVIDER_ALIAS,
      useClass: CollectorProvider,
    },
  ],
  exports: [
    ClientService,
    OptionService,
    COLLECTOR_EXPLORER_ALIAS,
    REFLECT_METADATA_PROVIDER_ALIAS,
    DISCORD_COMMAND_PROVIDER_ALIAS,
    DISCORD_CLIENT_PROVIDER_ALIAS,
    DISCORD_COLLECTOR_PROVIDER_ALIAS,
    DISCORD_MODULE_OPTIONS,
  ],
})
export class DiscordHostModule {}
