import { DiscordCommand } from '../../definitions/interfaces/discord-command';
import { DiscordCommandProvider } from '../../providers/discord-command.provider';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { BuildApplicationCommandService } from '../../services/build-application-command.service';
import { CommandTreeService } from '../../services/command-tree.service';
import { DiscordClientService } from '../../services/discord-client.service';
import { FilterResolver } from '../filter/filter.resolver';
import { GuardResolver } from '../guard/guard.resolver';
import { ClassResolveOptions } from '../interfaces/class-resolve-options';
import { ClassResolver } from '../interfaces/class-resolver';
import { MiddlewareResolver } from '../middleware/middleware.resolver';
import { PipeResolver } from '../pipe/pipe.resolver';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Interaction } from 'discord.js';

@Injectable()
export class CommandResolver implements ClassResolver {
  constructor(
    private readonly discordClientService: DiscordClientService,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly discordCommandProvider: DiscordCommandProvider,
    private readonly guardResolver: GuardResolver,
    private readonly moduleRef: ModuleRef,
    private readonly pipeResolver: PipeResolver,
    private readonly buildApplicationCommandService: BuildApplicationCommandService,
    private readonly commandTreeService: CommandTreeService,
    private readonly filterResolver: FilterResolver,
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
    const applicationCommandData =
      await this.buildApplicationCommandService.resolveCommandOptions(
        instance,
        methodName,
        metadata,
      );

    this.discordCommandProvider.addCommand(applicationCommandData);

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

        try {
          //#region apply middleware, guard, pipe
          await this.middlewareResolver.applyMiddleware(event, [interaction]);
          const isAllowFromGuards = await this.guardResolver.applyGuard({
            instance,
            methodName,
            event,
            context: [interaction],
          });
          if (!isAllowFromGuards) return;

          const pipeResult = await this.pipeResolver.applyPipe({
            instance: commandInstance,
            methodName,
            event,
            metatype: dtoInstance?.constructor,
            eventArgs: [interaction],
            initValue: interaction,
            commandNode,
          });
          //#endregion

          const handlerArgs = dtoInstance
            ? [pipeResult, interaction]
            : [interaction];
          const replyResult = await commandInstance[methodName](...handlerArgs);

          if (replyResult) await interaction.reply(replyResult);
        } catch (exception) {
          const isTrowException = await this.filterResolver.applyFilter({
            instance: commandInstance,
            methodName,
            event,
            metatype: dtoInstance?.constructor,
            eventArgs: [interaction],
            exception,
            commandNode,
          });

          if (isTrowException) throw exception;
        }
      });
  }
}
