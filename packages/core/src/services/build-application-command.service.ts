import { Injectable, Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import {
  ApplicationCommandChannelOptionData,
  ApplicationCommandChoicesData,
  ApplicationCommandNonOptionsData,
  ApplicationCommandOptionData,
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
  ApplicationCommandData,
} from 'discord.js';
import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
} from 'discord.js/typings/enums';

import { CommandOptions } from '../decorators/command/command-options';
import { isSubCommandGroup } from '../decorators/sub-command-group/is-sub-command-group';
import { SubCommandGroupOptions } from '../decorators/sub-command-group/sub-command-group-options';
import { DiscordCommand } from '../definitions/interfaces/discord-command';
import { TInclude } from '../definitions/types/include.type';
import { ReflectMetadataProvider } from '../providers/reflect-metadata.provider';
import { OptionResolver } from '../resolvers/option/option.resolver';
import { ParamResolver } from '../resolvers/param/param.resolver';
import { CommandTreeService } from './command-tree.service';

type NonCommandData =
  | ApplicationCommandNonOptionsData
  | ApplicationCommandChannelOptionData
  | ApplicationCommandChoicesData;

@Injectable()
export class BuildApplicationCommandService {
  constructor(
    private readonly paramResolver: ParamResolver,
    private readonly moduleRef: ModuleRef,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly optionResolver: OptionResolver,
    private readonly commandTreeService: CommandTreeService,
  ) {}

  async resolveCommandOptions(
    instance: DiscordCommand,
    methodName: string,
    { name, description, include = [], defaultPermission, type }: CommandOptions,
  ): Promise<ApplicationCommandData> {
    this.paramResolver.resolve({ instance, methodName });
    const payloadType = this.paramResolver.getPayloadType({
      instance,
      methodName,
    });
    this.commandTreeService.appendNode([name], { instance });
    const applicationCommandData: ApplicationCommandData = {
      type,
      name,
      description,
      defaultPermission,
    };

    if(applicationCommandData.type === ApplicationCommandTypes.CHAT_INPUT) {
      applicationCommandData.options = await this.resolveSubCommandOptions(
        name,
        include,
      );
    }

    let dtoInstance: any;
    if (payloadType) {
      dtoInstance = await this.moduleRef.create(payloadType);
      this.commandTreeService.appendNode([name, 'dtoInstance'], dtoInstance);
      const optionMetadata = this.optionResolver.resolve(dtoInstance);
      const commandOptions: NonCommandData[] = [];
      for (const property in optionMetadata) {
        const propertyOptions = optionMetadata[property];
        const {
          name,
          description,
          required = false,
          type,
        } = propertyOptions.param;

        commandOptions.push({
          name,
          description,
          required,
          type,
          choices: propertyOptions.choice,
          channelTypes: propertyOptions.channelTypes,
        });
      }

      if(applicationCommandData.type === ApplicationCommandTypes.CHAT_INPUT) {
        applicationCommandData.options = applicationCommandData.options.concat(
          this.sortByRequired(commandOptions),
        );
      }
    }

    return applicationCommandData;
  }

  private async resolveSubCommandOptions(
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
    { options: { name, description }, subCommands }: SubCommandGroupOptions,
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
      type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
      options: subCommandOptions,
    };
  }

  private async getSubCommandOptions(
    subCommandType: Type,
    commandName: string,
    subGroupName?: string,
  ): Promise<ApplicationCommandSubCommandData> {
    const subCommandInstance = await this.moduleRef.create(subCommandType);
    const metadata =
      this.metadataProvider.getSubCommandDecoratorMetadata(subCommandInstance);

    if (!metadata) throw new Error(`Passed class is not a subcommand`);

    this.commandTreeService.appendNode(
      [commandName, subGroupName, metadata.name],
      { instance: subCommandInstance },
    );

    const methodName = 'handler';
    this.paramResolver.resolve({ instance: subCommandInstance, methodName });

    const payloadType = this.paramResolver.getPayloadType({
      instance: subCommandInstance,
      methodName,
    });
    const applicationSubCommandData: ApplicationCommandSubCommandData = {
      name: metadata.name,
      description: metadata.description,
      type: ApplicationCommandOptionTypes.SUB_COMMAND,
    };
    const applicationSubCommandOptions = [];

    if (payloadType) {
      const dtoInstance = await this.moduleRef.create(payloadType);
      this.commandTreeService.appendNode(
        [commandName, subGroupName, metadata.name, 'dtoInstance'],
        dtoInstance,
      );
      const optionMetadata = this.optionResolver.resolve(dtoInstance);
      for (const property in optionMetadata) {
        const propertyOptions = optionMetadata[property];
        const {
          name,
          description,
          required = false,
          type,
        } = propertyOptions.param;

        applicationSubCommandOptions.push({
          name,
          description,
          required,
          type,
          choices: propertyOptions.choice,
        });
      }
    }

    if (applicationSubCommandOptions.length !== 0)
      applicationSubCommandData.options = this.sortByRequired(
        applicationSubCommandOptions,
      );

    return applicationSubCommandData;
  }

  private sortByRequired<TOption extends { required?: boolean }>(
    options: TOption[],
  ): TOption[] {
    return options.sort((first, second) => {
      return first.required > second.required ? -1 : 1;
    });
  }
}
