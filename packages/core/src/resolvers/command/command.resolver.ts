import { Injectable } from '@nestjs/common';
import { MethodResolveOptions } from '../interfaces/method-resolve-options';
import { MethodResolver } from '../interfaces/method-resolver';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordClientService } from '../../services/discord-client.service';
import { Interaction } from 'discord.js';
import { DiscordCommandStore } from '../../store/discord-command-store';
import { MiddlewareResolver } from '../middleware/middleware.resolver';
import { GuardResolver } from '../guard/guard.resolver';

@Injectable()
export class CommandResolver implements MethodResolver {
  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly discordCommandStore: DiscordCommandStore,
    private readonly guardResolver: GuardResolver,
  ) {}

  async resolve({ instance, methodName }: MethodResolveOptions): Promise<void> {
    const metadata = this.metadataProvider.getCommandDecoratorMetadata(
      instance,
      methodName,
    );
    if (!metadata) {
      return;
    }

    const { name, description, defaultPermission } = metadata;

    this.discordCommandStore.addCommand({
      name,
      description,
      defaultPermission,
    });

    const event = 'interactionCreate';

    this.discordClientService
      .getClient()
      .on(event, async (interaction: Interaction) => {
        if (!interaction.isCommand() || interaction.commandName !== name)
          return;

        await this.middlewareResolver.applyMiddleware(event, [interaction]);
        const isAllowFromGuards = await this.guardResolver.applyGuard({
          instance,
          methodName,
          event,
          context: [interaction],
        });
        if (!isAllowFromGuards) {
          return;
        }

        await instance[methodName](interaction);
      });
  }
}
