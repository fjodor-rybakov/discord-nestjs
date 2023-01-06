import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ApplicationCommandData,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
  ApplicationCommandType,
} from 'discord.js';

import { CommandOptions } from '../decorators/command/command-options';
import { isSubCommandGroup } from '../decorators/sub-command-group/is-sub-command-group';
import { SubCommandGroupOptions } from '../decorators/sub-command-group/sub-command-group-options';
import { TInclude } from '../definitions/types/include.type';
import { OptionExplorer } from '../explorers/option/option.explorer';
import { ReflectMetadataProvider } from '../providers/reflect-metadata.provider';
import { CommandHandlerFinderService } from './command-handler-finder.service';
import { CommandTreeService } from './command-tree.service';
import { DtoService } from './dto.service';

@Injectable()
export class BuildApplicationCommandService {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly optionExplorer: OptionExplorer,
    private readonly commandTreeService: CommandTreeService,
    private readonly dtoService: DtoService,
    private readonly commandHandlerFinderService: CommandHandlerFinderService,
  ) {}

  async exploreCommandOptions(
    instance: InstanceType<any>,
    {
      name,
      description,
      include = [],
      dmPermission,
      defaultMemberPermissions,
      type = ApplicationCommandType.ChatInput,
      nameLocalizations,
      descriptionLocalizations,
    }: CommandOptions,
  ): Promise<ApplicationCommandData> {
    const methodName = await this.commandHandlerFinderService.searchHandler(
      instance,
    );

    this.commandTreeService.appendNode([name], { instance, methodName });
    const applicationCommandData: ApplicationCommandData = {
      type,
      name,
      description,
      dmPermission,
      defaultMemberPermissions,
      nameLocalizations,
      descriptionLocalizations,
    };

    if (applicationCommandData.type === ApplicationCommandType.ChatInput)
      applicationCommandData.options = await this.exploreSubCommandOptions(
        name,
        include,
      );

    const dtoType = await this.dtoService.getDtoMetatype(instance, methodName);

    if (dtoType) {
      const commandOptions = this.dtoService.exploreDtoOptions(dtoType);

      if (applicationCommandData.type === ApplicationCommandType.ChatInput)
        applicationCommandData.options = applicationCommandData.options.concat(
          this.sortByRequired(commandOptions),
        );
    }

    return applicationCommandData;
  }

  private async exploreSubCommandOptions(
    commandName: string,
    rawCommandOptions: TInclude[],
  ): Promise<ApplicationCommandOptionData[]> {
    return Promise.all(
      rawCommandOptions.map<Promise<ApplicationCommandOptionData>>(
        (item: TInclude) => {
          if (isSubCommandGroup(item))
            return this.getSubCommandGroupOptions(item(), commandName);

          return this.getSubCommandOptions(item, commandName);
        },
      ),
    );
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
  ): Promise<ApplicationCommandSubGroupData> {
    this.commandTreeService.appendNode([commandName, name], {});

    const subCommandOptions: ApplicationCommandSubCommandData[] =
      await Promise.all(
        subCommands.map((subCommandType) =>
          this.getSubCommandOptions(subCommandType, commandName, name),
        ),
      );

    return {
      name,
      description,
      type: ApplicationCommandOptionType.SubcommandGroup,
      options: subCommandOptions,
      nameLocalizations,
      descriptionLocalizations,
    };
  }

  private async getSubCommandOptions(
    subCommandType: Type,
    commandName: string,
    subGroupName?: string,
  ): Promise<ApplicationCommandSubCommandData> {
    const subCommandInstance = this.moduleRef.get(subCommandType, {
      strict: false,
    });
    const metadata =
      this.metadataProvider.getSubCommandDecoratorMetadata(subCommandInstance);

    if (!metadata) throw new Error(`Passed class is not a subcommand`);

    const methodName = await this.commandHandlerFinderService.searchHandler(
      subCommandInstance,
    );

    this.commandTreeService.appendNode(
      [commandName, subGroupName, metadata.name],
      { instance: subCommandInstance, methodName },
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
      const commandOptions = this.dtoService.exploreDtoOptions(dtoType);

      if (commandOptions.length !== 0)
        applicationSubCommandData.options = this.sortByRequired(commandOptions);
    }

    return applicationSubCommandData;
  }

  private sortByRequired<TOption extends { required?: boolean }>(
    options: TOption[],
  ): TOption[] {
    return options.sort((first, second) =>
      first.required > second.required ? -1 : 1,
    );
  }
}
