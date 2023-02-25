import { ForbiddenException, Injectable } from '@nestjs/common';
import { ExternalContextCreator } from '@nestjs/core/helpers/external-context-creator';
import { ClientEvents } from 'discord.js';

import { EVENT_PARAMS_DECORATOR } from '../../decorators/param/event-param.constant';
import { EventContext } from '../../definitions/interfaces/event-context';
import { DiscordParamFactory } from '../../factory/discord-param-factory';
import { ReflectMetadataProvider } from '../../providers/reflect-metadata.provider';
import { BuildApplicationCommandService } from '../../services/build-application-command.service';
import { ClientService } from '../../services/client.service';
import { OptionService } from '../../services/option.service';
import { ClassExplorer } from '../interfaces/class-explorer';
import { ClassExplorerOptions } from '../interfaces/class-explorer-options';

@Injectable()
export class CommandExplorer implements ClassExplorer {
  constructor(
    private readonly discordClientService: ClientService,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly buildApplicationCommandService: BuildApplicationCommandService,
    private readonly externalContextCreator: ExternalContextCreator,
    private readonly optionService: OptionService,
  ) {}

  private readonly discordParamFactory = new DiscordParamFactory();
  private readonly event: keyof ClientEvents = 'interactionCreate';

  async explore({ instance }: ClassExplorerOptions): Promise<void> {
    const metadata =
      this.metadataProvider.getCommandDecoratorMetadata(instance);
    if (!metadata) return;

    const commandData =
      await this.buildApplicationCommandService.exploreCommand(
        instance,
        metadata,
      );

    commandData.forEach(
      ({
        name,
        group,
        subName,
        methodName: commandMethodName,
        instance: commandInstance,
      }) => {
        if (!commandMethodName || !commandInstance) {
          return;
        }

        const handler = this.externalContextCreator.create(
          commandInstance,
          commandInstance[commandMethodName],
          commandMethodName,
          EVENT_PARAMS_DECORATOR,
          this.discordParamFactory,
        );

        this.listenCommand(handler, name, subName, group);
      },
    );
  }

  private listenCommand(
    handler: (...args: any[]) => Promise<any>,
    commandName: string,
    subCommandName?: string,
    groupName?: string,
  ): void {
    this.discordClientService
      .getClient()
      .on(
        this.event,
        async (...eventArgs: ClientEvents['interactionCreate']) => {
          const [interaction] = eventArgs;
          if (
            (!interaction.isChatInputCommand() &&
              !interaction.isContextMenuCommand()) ||
            interaction.commandName !== commandName
          ) {
            return;
          }

          if (
            interaction.isChatInputCommand() &&
            ((groupName &&
              interaction.options.getSubcommandGroup(false) !== groupName) ||
              (subCommandName &&
                interaction.options.getSubcommand(false) !== subCommandName))
          )
            return;

          try {
            const returnReply = await handler(...eventArgs, {
              event: this.event,
              collectors: [],
            } as EventContext);

            if (returnReply) {
              await interaction.reply(returnReply);
            }
          } catch (exception) {
            if (
              exception instanceof ForbiddenException &&
              this.optionService.getClientData().isTrowForbiddenException
            )
              throw exception;
          }
        },
      );
  }
}
