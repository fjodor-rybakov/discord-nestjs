import { Module } from '@nestjs/common';

import { DISCORD_CLIENT_PROVIDER_ALIAS } from './definitions/constants/discord-client-provider-alias';
import { DISCORD_COMMAND_PROVIDER_ALIAS } from './definitions/constants/discord-command-provider-alias';
import { DISCORD_MODULE_OPTIONS } from './definitions/constants/discord-module.contant';
import { REFLECT_METADATA_PROVIDER_ALIAS } from './definitions/constants/reflect-metadata-provider-alias';
import { DiscordClientProvider } from './providers/discord-client.provider';
import { DiscordCommandProvider } from './providers/discord-command.provider';
import { ReflectMetadataProvider } from './providers/reflect-metadata.provider';
import { DiscordClientService } from './services/discord-client.service';
import { DiscordOptionService } from './services/discord-option.service';

@Module({
  providers: [
    DiscordClientService,
    DiscordOptionService,
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
  ],
  exports: [
    DiscordClientService,
    DiscordOptionService,
    REFLECT_METADATA_PROVIDER_ALIAS,
    DISCORD_COMMAND_PROVIDER_ALIAS,
    DISCORD_CLIENT_PROVIDER_ALIAS,
    DISCORD_MODULE_OPTIONS,
  ],
})
export class DiscordHostModule {}
