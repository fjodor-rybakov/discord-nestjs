import { Injectable, Logger, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ApplicationCommandData,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ApplicationCommandType,
} from 'discord.js';

import { ChatInputCommandOptions } from '../decorators/command/chat-input-command-options';
import { isSubCommandGroup } from '../decorators/sub-command-group/is-sub-command-group';
import { SubCommandGroupOptions } from '../decorators/sub-command-group/sub-command-group-options';
import { TInclude } from '../definitions/types/include.type';
import { CommandListenerDescribe } from '../explorers/command/interfaces/command-listener-describe';
import { OptionExplorer } from '../explorers/option/option.explorer';
import { DiscordCommandProvider } from '../providers/discord-command.provider';
import { ReflectMetadataProvider } from '../providers/reflect-metadata.provider';
import { CommandHandlerFinderService } from './command-handler-finder.service';
import { DtoService } from './dto.service';

interface CommandExploreOptions<T> {
  commandListenersDescribe: CommandListenerDescribe[];

  applicationCommandData: T;
}

@Injectable()
export class BuildApplicationCommandService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly optionExplorer: OptionExplorer,
    private readonly discordCommandProvider: DiscordCommandProvider,
    private readonly dtoService: DtoService,
    private readonly commandHandlerFinderService: CommandHandlerFinderService,
  ) {}

  async exploreCommand(
    instance: InstanceType<any>,
    chatInputCommandOptions: ChatInputCommandOptions,
  ): Promise<CommandListenerDescribe[]> {
    const methodName = await this.commandHandlerFinderService.searchHandler(
      instance,
    );
    const commandData = this.getBaseApplicationCommandData(
      chatInputCommandOptions,
    );
    const commandListenersDescribe: CommandListenerDescribe[] = [];

    if (commandData.type === ApplicationCommandType.ChatInput) {
      commandData.options = await Promise.all(
        chatInputCommandOptions.include.map(async (item: TInclude) => {
          const subCommandOption = await this.exploreSubCommandOptions(
            commandData.name,
            item,
          );

          commandListenersDescribe.push(
            ...subCommandOption.commandListenersDescribe,
          );

          return subCommandOption.applicationCommandData;
        }),
      );
    }

    if (commandListenersDescribe.length === 0) {
      commandListenersDescribe.push({
        name: commandData.name,
        instance,
        methodName,
      });
    }

    const dtoType = await this.dtoService.getDtoMetatype(instance, methodName);

    if (dtoType) {
      const commandParams = this.dtoService.exploreDtoOptions(dtoType);

      if (commandData.type === ApplicationCommandType.ChatInput)
        commandData.options = commandData.options.concat(commandParams);
    }

    if (Logger.isLevelEnabled('debug')) {
      Logger.debug(
        'Slash command options',
        BuildApplicationCommandService.name,
      );
      Logger.debug(commandData, BuildApplicationCommandService.name);
    }

    this.discordCommandProvider.addCommand(instance.constructor, {
      commandData,
      additionalOptions: { forGuild: chatInputCommandOptions.forGuild },
    });

    return commandListenersDescribe;
  }

  private async exploreSubCommandOptions(
    commandName: string,
    item: TInclude,
  ): Promise<CommandExploreOptions<ApplicationCommandOptionData>> {
    if (isSubCommandGroup(item)) {
      return this.getSubCommandGroupOptions(item(), commandName);
    }

    return this.getSubCommandOptions(item, commandName);
  }

  private async getSubCommandGroupOptions(
    {
      options: {
        name,
        description,
        nameLocalizations,
        descriptionLocalizations,
      },
      subCommands,
    }: SubCommandGroupOptions,
    commandName: string,
  ): Promise<CommandExploreOptions<ApplicationCommandOptionData>> {
    const subCommandOptions: ApplicationCommandSubCommandData[] = [];
    let commandListenersDescribe: CommandListenerDescribe[] = [];

    await Promise.all(
      subCommands.map(async (subCommandType) => {
        const subCommandOption = await this.getSubCommandOptions(
          subCommandType,
          commandName,
          name,
        );

        subCommandOptions.push(subCommandOption.applicationCommandData);
        commandListenersDescribe = commandListenersDescribe.concat(
          subCommandOption.commandListenersDescribe,
        );
      }),
    );

    return {
      commandListenersDescribe,
      applicationCommandData: {
        name,
        description,
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: subCommandOptions,
        nameLocalizations,
        descriptionLocalizations,
      },
    };
  }

  private async getSubCommandOptions(
    subCommandType: Type,
    commandName: string,
    subGroupName?: string,
  ): Promise<CommandExploreOptions<ApplicationCommandSubCommandData>> {
    const subCommandInstance = this.moduleRef.get(subCommandType, {
      strict: false,
    });
    const metadata =
      this.metadataProvider.getSubCommandDecoratorMetadata(subCommandInstance);

    if (!metadata) throw new Error(`Passed class is not a subcommand`);

    const methodName = await this.commandHandlerFinderService.searchHandler(
      subCommandInstance,
    );

    const dtoType = await this.dtoService.getDtoMetatype(
      subCommandInstance,
      methodName,
    );
    const applicationSubCommandData: ApplicationCommandSubCommandData = {
      name: metadata.name,
      description: metadata.description,
      type: ApplicationCommandOptionType.Subcommand,
      nameLocalizations: metadata.nameLocalizations,
      descriptionLocalizations: metadata.descriptionLocalizations,
    };

    if (dtoType) {
      applicationSubCommandData.options =
        this.dtoService.exploreDtoOptions(dtoType);
    }

    return {
      commandListenersDescribe: [
        {
          name: commandName,
          subName: metadata.name,
          group: subGroupName,
          instance: subCommandInstance,
          methodName,
        },
      ],
      applicationCommandData: applicationSubCommandData,
    };
  }

  private getBaseApplicationCommandData(
    chatInputCommandOptions: ChatInputCommandOptions,
  ): ApplicationCommandData {
    const {
      name,
      description,
      dmPermission,
      defaultMemberPermissions,
      type = ApplicationCommandType.ChatInput,
      nameLocalizations,
      descriptionLocalizations,
    } = chatInputCommandOptions;

    return {
      type,
      name,
      description,
      dmPermission,
      defaultMemberPermissions,
      nameLocalizations,
      descriptionLocalizations,
    };
  }
}
