import { MetadataScanner } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationCommandType } from 'discord.js';

import { ChatInputCommandOptions } from '../decorators/command/chat-input-command-options';
import { Command } from '../decorators/command/command.decorator';
import { Handler } from '../decorators/command/handler/handler.decorator';
import { Param } from '../decorators/option/param/param.decorator';
import { UseGroup } from '../decorators/sub-command-group/use-group';
import { SubCommand } from '../decorators/sub-command/sub-command.decorator';
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

  describe('Subcommand', () => {
    class EmailDto {
      @Param({ description: 'Your email' })
      email: string;
    }

    @SubCommand({
      name: 'email',
      description: 'Register by subcommand',
    })
    class EmailSubCommand {
      @Handler()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onEmailCommand(dto: EmailDto) {
        return 'ok';
      }
    }

    @SubCommand({
      name: 'base-info',
      description: 'Return base info about user',
    })
    class BaseInfoSubCommand {
      @Handler()
      onBaseInfoCommand() {
        return 'ok';
      }
    }

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
          EmailSubCommand,
          BaseInfoSubCommand,
        ],
      }).compile();
    });

    it('should explore slash sub command and add it to DiscordCommandProvider', async () => {
      const buildApplicationCommand = testingModule.get(
        BuildApplicationCommandService,
      );

      const commandOptions = {
        name: 'reg',
        description: 'User registration',
        include: [
          UseGroup(
            { name: 'type', description: 'Registration type' },
            EmailSubCommand,
          ),
          BaseInfoSubCommand,
        ],
      };

      @Command(commandOptions)
      class RegistrationCommand {}

      const commandInstance = new RegistrationCommand();
      const discordCommandProvider = testingModule.get(DiscordCommandProvider);
      jest.spyOn(discordCommandProvider, 'addCommand');

      const actual = await buildApplicationCommand.exploreCommand(
        commandInstance,
        commandOptions,
      );

      expect(actual).toStrictEqual(
        expect.arrayContaining([
          {
            group: 'type',
            instance: testingModule.get(EmailSubCommand),
            methodName: 'onEmailCommand',
            name: 'reg',
            subName: 'email',
          },
          {
            group: undefined,
            instance: testingModule.get(BaseInfoSubCommand),
            methodName: 'onBaseInfoCommand',
            name: 'reg',
            subName: 'base-info',
          },
        ]),
      );

      expect(discordCommandProvider.addCommand).toBeCalledWith(
        RegistrationCommand,
        {
          additionalOptions: { forGuild: undefined },
          commandData: {
            defaultMemberPermissions: undefined,
            description: 'User registration',
            descriptionLocalizations: undefined,
            dmPermission: undefined,
            name: 'reg',
            nameLocalizations: undefined,
            options: [
              {
                description: 'Registration type',
                descriptionLocalizations: undefined,
                name: 'type',
                nameLocalizations: undefined,
                options: [
                  {
                    description: 'Register by subcommand',
                    descriptionLocalizations: undefined,
                    name: 'email',
                    nameLocalizations: undefined,
                    options: [
                      {
                        autocomplete: undefined,
                        channelTypes: undefined,
                        choices: undefined,
                        description: 'Your email',
                        descriptionLocalizations: undefined,
                        maxLength: undefined,
                        maxValue: undefined,
                        minLength: undefined,
                        minValue: undefined,
                        name: 'email',
                        nameLocalizations: undefined,
                        required: false,
                        type: 3,
                      },
                    ],
                    type: 1,
                  },
                ],
                type: 2,
              },
              {
                description: 'Return base info about user',
                descriptionLocalizations: undefined,
                name: 'base-info',
                nameLocalizations: undefined,
                type: 1,
              },
            ],
            type: 1,
          },
        },
      );
    });
  });
});
