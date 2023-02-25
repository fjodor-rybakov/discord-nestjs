import { MetadataScanner } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationCommandType } from 'discord.js';

import { ChatInputCommandOptions } from '../decorators/command/chat-input-command-options';
import { Command } from '../decorators/command/command.decorator';
import { Handler } from '../decorators/command/handler/handler.decorator';
import { Param } from '../decorators/option/param/param.decorator';
import { OptionExplorer } from '../explorers/option/option.explorer';
import { DiscordCommandProvider } from '../providers/discord-command.provider';
import { ReflectMetadataProvider } from '../providers/reflect-metadata.provider';
import { BuildApplicationCommandService } from './build-application-command.service';
import { CommandHandlerFinderService } from './command-handler-finder.service';
import { DtoService } from './dto.service';

describe('Build application command service', () => {
  let testingModule: TestingModule;

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        BuildApplicationCommandService,
        ReflectMetadataProvider,
        DiscordCommandProvider,
        DtoService,
        OptionExplorer,
        CommandHandlerFinderService,
        MetadataScanner,
      ],
    }).compile();
  });

  it('should explore slash command and add it to DiscordCommandProvider', async () => {
    const buildApplicationCommand = testingModule.get(
      BuildApplicationCommandService,
    );
    const commandOptions: ChatInputCommandOptions = {
      name: 'play',
      type: ApplicationCommandType.ChatInput,
      description: 'Play command',
    };

    @Command(commandOptions)
    class PlayCommand {
      @Handler()
      onPlayCommand() {
        return 'ok';
      }
    }
    const commandInstance = new PlayCommand();
    jest
      .spyOn(testingModule.get(CommandHandlerFinderService), 'searchHandler')
      .mockResolvedValueOnce(commandInstance.onPlayCommand.name);
    const discordCommandProvider = testingModule.get(DiscordCommandProvider);
    jest.spyOn(discordCommandProvider, 'addCommand');

    const actual = await buildApplicationCommand.exploreCommand(
      commandInstance,
      commandOptions,
    );

    expect(actual).toStrictEqual(
      expect.arrayContaining([
        {
          name: 'play',
          instance: commandInstance,
          methodName: 'onPlayCommand',
        },
      ]),
    );
    expect(discordCommandProvider.addCommand).toBeCalledWith(PlayCommand, {
      additionalOptions: { forGuild: undefined },
      commandData: {
        defaultMemberPermissions: undefined,
        description: 'Play command',
        descriptionLocalizations: undefined,
        dmPermission: undefined,
        name: 'play',
        nameLocalizations: undefined,
        options: [],
        type: 1,
      },
    });
  });

  it('should explore slash command with options and add it to DiscordCommandProvider', async () => {
    const buildApplicationCommand = testingModule.get(
      BuildApplicationCommandService,
    );
    const commandOptions: ChatInputCommandOptions = {
      name: 'play',
      type: ApplicationCommandType.ChatInput,
      description: 'Play command',
    };

    class PlayOptions {
      @Param({ description: 'Track name' })
      track: string;
    }

    @Command(commandOptions)
    class PlayCommand {
      @Handler()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onPlayCommand(dto: PlayOptions) {
        return 'ok';
      }
    }
    const commandInstance = new PlayCommand();
    jest
      .spyOn(testingModule.get(CommandHandlerFinderService), 'searchHandler')
      .mockResolvedValueOnce(commandInstance.onPlayCommand.name);
    const discordCommandProvider = testingModule.get(DiscordCommandProvider);
    jest.spyOn(discordCommandProvider, 'addCommand');

    const actual = await buildApplicationCommand.exploreCommand(
      commandInstance,
      commandOptions,
    );

    expect(actual).toStrictEqual(
      expect.arrayContaining([
        {
          name: 'play',
          instance: commandInstance,
          methodName: 'onPlayCommand',
        },
      ]),
    );
    expect(discordCommandProvider.addCommand).toBeCalledWith(PlayCommand, {
      additionalOptions: { forGuild: undefined },
      commandData: {
        defaultMemberPermissions: undefined,
        description: 'Play command',
        descriptionLocalizations: undefined,
        dmPermission: undefined,
        name: 'play',
        nameLocalizations: undefined,
        options: [
          {
            autocomplete: undefined,
            channelTypes: undefined,
            choices: undefined,
            description: 'Track name',
            descriptionLocalizations: undefined,
            maxLength: undefined,
            maxValue: undefined,
            minLength: undefined,
            minValue: undefined,
            name: 'track',
            nameLocalizations: undefined,
            required: false,
            type: 3,
          },
        ],
        type: 1,
      },
    });
  });
});
