import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { DiscordClientService } from '../../services/discord-client.service';
import { Interaction } from 'discord.js';
import { DiscordCommandStore } from '../../store/discord-command-store';
import { MiddlewareResolver } from '../middleware/middleware.resolver';
import { GuardResolver } from '../guard/guard.resolver';
import { ClassResolver } from '../interfaces/class-resolver';
import { ClassResolveOptions } from '../interfaces/class-resolve-options';
import { DiscordCommand } from '../../definitions/interfaces/discord-command';
import { ModuleRef } from '@nestjs/core';
import { ParamResolver } from '../param/param.resolver';
import { PipeResolver } from '../pipe/pipe.resolver';
import { BuildApplicationCommandService } from '../../services/build-application-command.service';
import { CommandTreeService } from '../../services/command-tree.service';

@Injectable()
export class CommandResolver implements ClassResolver {
  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly discordCommandStore: DiscordCommandStore,
    private readonly paramResolver: ParamResolver,
    private readonly guardResolver: GuardResolver,
    private readonly moduleRef: ModuleRef,
    private readonly pipeResolver: PipeResolver,
    private readonly buildApplicationCommandService: BuildApplicationCommandService,
    private readonly commandTreeService: CommandTreeService,
  ) {}

  async resolve({
    instance,
  }: ClassResolveOptions<DiscordCommand>): Promise<void> {
    const metadata =
      this.metadataProvider.getCommandDecoratorMetadata(instance);
    if (!metadata) return;

    const { name } = metadata;
    const event = 'interactionCreate';
    const methodName = 'handler';
    const handlerParams = this.paramResolver.getPayloadType({
      instance,
      methodName,
    });
    const applicationCommandData =
      await this.buildApplicationCommandService.resolveCommandOptions(
        instance,
        methodName,
        metadata,
      );

    this.discordCommandStore.addCommand(applicationCommandData);

    this.discordClientService
      .getClient()
      .on(event, async (interaction: Interaction) => {
        if (!interaction.isCommand() || interaction.commandName !== name)
          return;

        const subcommand = interaction.options.getSubcommand(false);
        const subcommandGroup = interaction.options.getSubcommandGroup(false);

        const commandNode = this.commandTreeService.getNode([
          interaction.commandName,
          subcommandGroup,
          subcommand,
        ]);

        const { dtoInstance, instance: commandInstance } = commandNode;

        await this.middlewareResolver.applyMiddleware(event, [interaction]);
        const isAllowFromGuards = await this.guardResolver.applyGuard({
          instance,
          methodName,
          event,
          context: [interaction],
        });
        if (!isAllowFromGuards) return;

        await this.pipeResolver.applyPipe({
          instance,
          methodName,
          event,
          metatype: handlerParams,
          context: [interaction],
          initValue: interaction,
        });

        const replyResult = await commandInstance[methodName](
          dtoInstance ?? interaction,
        );

        if (replyResult) await interaction.reply(replyResult);
      });
  }
}
