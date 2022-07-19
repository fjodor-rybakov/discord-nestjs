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
import { DiscordCommand } from '../definitions/interfaces/discord-command';
import { TInclude } from '../definitions/types/include.type';
import { OptionExplorer } from '../explorers/option/option.explorer';
import { ReflectMetadataProvider } from '../providers/reflect-metadata.provider';
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
  ) {}

  async exploreCommandOptions(
    instance: DiscordCommand,
    methodName: string,
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
    this.commandTreeService.appendNode([name], { instance });
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

    const dtoInstance = await this.dtoService.createDtoInstance(
      instance,
      methodName,
    );

    if (dtoInstance) {
      this.commandTreeService.appendNode([name, 'dtoInstance'], dtoInstance);
      const commandOptions = this.dtoService.exploreDtoOptions(dtoInstance);

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

    this.commandTreeService.appendNode(
      [commandName, subGroupName, metadata.name],
      { instance: subCommandInstance },
    );

    const methodName = 'handler';
    const dtoInstance = await this.dtoService.createDtoInstance(
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

    if (dtoInstance) {
      this.commandTreeService.appendNode(
        [commandName, subGroupName, metadata.name, 'dtoInstance'],
        dtoInstance,
      );
      const commandOptions = this.dtoService.exploreDtoOptions(dtoInstance);

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
