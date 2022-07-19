import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ButtonInteraction,
  ClientEvents,
  CollectedInteraction,
  Collector,
  InteractionCollector,
  Message,
  MessageCollector,
  SelectMenuInteraction,
  Snowflake,
} from 'discord.js';

import { CommandExecutionContext } from '../../definitions/interfaces/command-execution-context';
import { TransformedCommandExecutionContext } from '../../definitions/interfaces/transformed-command-execution-context';
import { DiscordCommandProvider } from '../../providers/discord-command.provider';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { BuildApplicationCommandService } from '../../services/build-application-command.service';
import { ClientService } from '../../services/client.service';
import { CommandTreeService } from '../../services/command-tree.service';
import { CollectorExplorer } from '../collector/collector.explorer';
import { FilterExplorer } from '../filter/filter.explorer';
import { GuardExplorer } from '../guard/guard.explorer';
import { ClassExplorer } from '../interfaces/class-explorer';
import { ClassExplorerOptions } from '../interfaces/class-explorer-options';
import { MiddlewareExplorer } from '../middleware/middleware.explorer';
import { PipeExplorer } from '../pipe/pipe.explorer';

@Injectable()
export class CommandExplorer implements ClassExplorer {
  constructor(
    private readonly discordClientService: ClientService,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly middlewareExplorer: MiddlewareExplorer,
    private readonly discordCommandProvider: DiscordCommandProvider,
    private readonly guardExplorer: GuardExplorer,
    private readonly moduleRef: ModuleRef,
    private readonly pipeExplorer: PipeExplorer,
    private readonly buildApplicationCommandService: BuildApplicationCommandService,
    private readonly commandTreeService: CommandTreeService,
    private readonly filterExplorer: FilterExplorer,
    private readonly collectorExplorer: CollectorExplorer,
  ) {}

  async explore({ instance }: ClassExplorerOptions): Promise<void> {
    const metadata =
      this.metadataProvider.getCommandDecoratorMetadata(instance);
    if (!metadata) return;

    const { name } = metadata;
    const event = 'interactionCreate';
    const methodName = 'handler';
    const applicationCommandData =
      await this.buildApplicationCommandService.exploreCommandOptions(
        instance,
        methodName,
        metadata,
      );

    if (Logger.isLevelEnabled('debug')) {
      Logger.debug('Slash command options', CommandExplorer.name);
      Logger.debug(applicationCommandData, CommandExplorer.name);
    }

    this.discordCommandProvider.addCommand(
      instance.constructor,
      applicationCommandData,
    );

    this.discordClientService
      .getClient()
      .on(event, async (...eventArgs: ClientEvents['interactionCreate']) => {
        const [interaction] = eventArgs;
        if (
          (!interaction.isChatInputCommand() &&
            !interaction.isContextMenuCommand()) ||
          interaction.commandName !== name
        ) {
          return;
        }

        let subcommand: string = null;
        let subcommandGroup: string = null;

        if (interaction.isChatInputCommand()) {
          subcommand = interaction.options.getSubcommand(false);
          subcommandGroup = interaction.options.getSubcommandGroup(false);
        }

        const commandNode = this.commandTreeService.getNode([
          interaction.commandName,
          subcommandGroup,
          subcommand,
        ]);

        const { dtoInstance, instance: commandInstance } = commandNode;

        try {
          //#region apply middleware, guard, pipe
          await this.middlewareExplorer.applyMiddleware(event, eventArgs);
          const isAllowFromGuards = await this.guardExplorer.applyGuard({
            instance: commandInstance,
            methodName,
            event,
            eventArgs,
          });
          if (!isAllowFromGuards) return;

          const pipeResult = await this.pipeExplorer.applyPipe({
            instance: commandInstance,
            methodName,
            event,
            metatype: dtoInstance?.constructor,
            eventArgs,
            initValue: interaction,
            commandNode,
          });
          //#endregion

          const collectors = await this.collectorExplorer.applyCollector({
            instance,
            methodName,
            event,
            eventArgs,
          });

          if (
            !!collectors &&
            !this.collectorsIsInteraction(collectors) &&
            !this.collectorsIsMessage(collectors)
          )
            throw new Error('Collectors cannot be apply');

          const transformedExecutionContext: TransformedCommandExecutionContext =
            {
              interaction,
              // TODO: Fix problem with types
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              collectors,
            };
          const executionContext: CommandExecutionContext<
            ButtonInteraction | SelectMenuInteraction
          > = {
            // TODO: Fix problem with types
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            collectors,
          };

          const handlerArgs = dtoInstance
            ? [pipeResult, transformedExecutionContext]
            : [interaction, executionContext];
          const replyResult = await commandInstance[methodName](...handlerArgs);

          if (replyResult) await interaction.reply(replyResult);
        } catch (exception) {
          const isTrowException = await this.filterExplorer.applyFilter({
            instance: commandInstance,
            methodName,
            event,
            metatype: dtoInstance?.constructor,
            eventArgs,
            exception,
            commandNode,
          });

          if (isTrowException) throw exception;
        }
      });
  }

  private collectorsIsInteraction(
    collectors: NonNullable<Collector<Snowflake, any, any>[]>,
  ): collectors is InteractionCollector<any>[] {
    return collectors.every(
      (collector) => collector instanceof InteractionCollector,
    );
  }

  private collectorsIsMessage(
    collectors: NonNullable<Collector<Snowflake, any, any>[]>,
  ): collectors is MessageCollector[] {
    return collectors.every(
      (collector) => collector instanceof MessageCollector,
    );
  }
}
