import { Injectable, Logger } from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { ClientEvents } from 'discord.js';

import { EVENT_PARAMS_DECORATOR } from '../../decorators/param/event-param.constant';
import { EventContext } from '../../definitions/interfaces/event-context';
import { DiscordParamFactory } from '../../factory/discord-param-factory';
import { DiscordCommandProvider } from '../../providers/discord-command.provider';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { BuildApplicationCommandService } from '../../services/build-application-command.service';
import { ClientService } from '../../services/client.service';
import { CommandTreeService } from '../../services/command-tree.service';
import { CollectorExplorer } from '../collector/collector.explorer';
import { ClassExplorer } from '../interfaces/class-explorer';
import { ClassExplorerOptions } from '../interfaces/class-explorer-options';

@Injectable()
export class CommandExplorer implements ClassExplorer {
  constructor(
    private readonly discordClientService: ClientService,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordCommandProvider: DiscordCommandProvider,
    private readonly buildApplicationCommandService: BuildApplicationCommandService,
    private readonly commandTreeService: CommandTreeService,
    private readonly collectorExplorer: CollectorExplorer,
    private readonly externalContextCreator: ExternalContextCreator,
  ) {}

  async explore({ instance }: ClassExplorerOptions): Promise<void> {
    const metadata =
      this.metadataProvider.getCommandDecoratorMetadata(instance);
    if (!metadata) return;

    const { name, forGuild } = metadata;
    const event = 'interactionCreate';
    const commandData =
      await this.buildApplicationCommandService.exploreCommandOptions(
        instance,
        metadata,
      );

    if (Logger.isLevelEnabled('debug')) {
      Logger.debug('Slash command options', CommandExplorer.name);
      Logger.debug(commandData, CommandExplorer.name);
    }

    this.discordCommandProvider.addCommand(instance.constructor, {
      commandData,
      additionalOptions: { forGuild },
    });

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

        const { instance: commandInstance, methodName: commandHandlerName } =
          commandNode;

        const handler = this.externalContextCreator.create(
          commandInstance,
          commandInstance[commandHandlerName],
          commandHandlerName,
          EVENT_PARAMS_DECORATOR,
          new DiscordParamFactory(),
        );

        const returnReply = await handler(...eventArgs, {
          event,
          collectors: [],
        } as EventContext);

        if (returnReply) {
          await interaction.reply(returnReply);
        }
      });
  }
}
