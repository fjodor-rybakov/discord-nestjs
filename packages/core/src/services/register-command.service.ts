import { Collection } from '@discordjs/collection';
import { Injectable, Logger } from '@nestjs/common';
import {
  ApplicationCommand,
  ApplicationCommandData,
  Client,
  GuildResolvable,
  Message,
} from 'discord.js';
import {
  Observable,
  OperatorFunction,
  from,
  groupBy,
  lastValueFrom,
  map,
  mergeMap,
  reduce,
  tap,
} from 'rxjs';

import { InjectDiscordClient } from '../decorators/client/inject-discord-client.decorator';
import { AppCommandData } from '../definitions/interfaces/app-command-data';
import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';
import { RegisterCommandOptions } from '../definitions/interfaces/register-command-options';
import { DiscordCommandProvider } from '../providers/discord-command.provider';
import { OptionService } from './option.service';

interface GroupedCommands {
  commandList: ApplicationCommandData[];
  registerCommandOptions: RegisterCommandOptions;
}

interface CommandWithRegistrationOptions {
  commandData: ApplicationCommandData;

  registerCommandOptions: RegisterCommandOptions;
}

@Injectable()
export class RegisterCommandService {
  private readonly logger = new Logger(RegisterCommandService.name);

  constructor(
    private readonly discordCommandProvider: DiscordCommandProvider,
    @InjectDiscordClient()
    private readonly client: Client,
    private readonly discordOptionService: OptionService,
  ) {}

  async register(): Promise<void> {
    const options = this.discordOptionService.getClientData();

    this.client.on('ready', () => this.registerCommands(this.client, options));
  }

  private async registerCommands(
    client: Client,
    { registerCommandOptions }: DiscordModuleOption,
  ): Promise<void> {
    const commands = this.discordCommandProvider.getAllCommands();

    if (commands.size === 0) return;

    const commandList = Array.from(commands.values());

    if (!client.application?.owner) await client.application?.fetch();

    await Promise.all(
      registerCommandOptions.map(
        async (commandOptions: RegisterCommandOptions) => {
          const { allowFactory, trigger } = commandOptions;

          const register = async () => {
            if (allowFactory) {
              client.on('messageCreate', async (message: Message) => {
                if (!allowFactory(message, commandList)) return;

                await lastValueFrom(
                  this.groupCommandsByGuildId(commandList, commandOptions).pipe(
                    tap((commandInfo) => this.setupCommands(commandInfo)),
                  ),
                );
              });
            } else {
              await lastValueFrom(
                this.groupCommandsByGuildId(commandList, commandOptions).pipe(
                  tap((commandInfo) => this.setupCommands(commandInfo)),
                ),
              );
            }
          };

          if (trigger)
            trigger(commandList).subscribe({
              next: async () => {
                await register();
              },
            });
          else await register();
        },
      ),
    );
  }

  private async dropMissingCommands(
    existCommands: Collection<string, ApplicationCommand>,
    commandList: ApplicationCommandData[],
  ): Promise<void> {
    const deleteCommands = existCommands.filter(
      (existCommand) =>
        !commandList.find(
          (newCommand) =>
            existCommand.name === newCommand.name &&
            existCommand.type === newCommand.type,
        ),
    );

    await Promise.all(deleteCommands.map((command) => command.delete()));
  }

  private splitByCommands(
    existCommandList: Collection<
      string,
      ApplicationCommand<{ guild: GuildResolvable }>
    >,
    commandList: ApplicationCommandData[],
  ): [
    ApplicationCommandData[],
    {
      existCommand: ApplicationCommand<{ guild: GuildResolvable }>;
      newCommand: ApplicationCommandData;
    }[],
  ] {
    return commandList.reduce(
      (result, newCommand) => {
        const alreadyExist = existCommandList.find(
          (existCommand) =>
            newCommand.name === existCommand.name &&
            newCommand.type === existCommand.type,
        );

        alreadyExist
          ? result[1].push({
              existCommand: alreadyExist,
              newCommand,
            })
          : result[0].push(newCommand);

        return result;
      },
      [[], []],
    );
  }

  private groupCommandsByGuildId(
    appCommandData: AppCommandData[],
    registerCommandOptions: RegisterCommandOptions,
  ): Observable<GroupedCommands> {
    return from(appCommandData).pipe(
      map((commandData) =>
        this.defineGuildIdForCommand(commandData, registerCommandOptions),
      ),
      groupBy(({ registerCommandOptions }) => registerCommandOptions.forGuild),
      mergeMap((group) => group.pipe(this.unionGroupByCommandData())),
    );
  }

  private defineGuildIdForCommand(
    { commandData, additionalOptions }: AppCommandData,
    registerCommandOptions: RegisterCommandOptions,
  ): CommandWithRegistrationOptions {
    if (additionalOptions.forGuild) {
      return {
        commandData,
        registerCommandOptions: {
          ...registerCommandOptions,
          forGuild: additionalOptions.forGuild,
        },
      };
    }

    return {
      commandData,
      registerCommandOptions,
    };
  }

  private unionGroupByCommandData(): OperatorFunction<
    CommandWithRegistrationOptions,
    GroupedCommands
  > {
    return reduce(
      (acc: GroupedCommands, { commandData, registerCommandOptions }) => {
        acc.commandList = acc.commandList.concat(commandData);
        acc.registerCommandOptions = registerCommandOptions;

        return acc;
      },
      {
        commandList: [],
      },
    );
  }

  private async setupCommands({
    commandList,
    registerCommandOptions: { forGuild, removeCommandsBefore },
  }: GroupedCommands): Promise<ApplicationCommand[]> {
    // Fetch guild or global commands
    const existCommandList = await this.client.application.commands.fetch(
      forGuild && {
        guildId: forGuild,
      },
    );

    // Remove if needed
    if (removeCommandsBefore) {
      await this.dropMissingCommands(existCommandList, commandList);

      this.logger.log(`All ${forGuild ? 'guild' : 'global'} commands removed!`);
    }

    let registeredCommands: ApplicationCommand[] = [];

    const [createCommands, editCommands] = this.splitByCommands(
      existCommandList,
      commandList,
    );

    // Edit existing commands
    if (editCommands.length !== 0) {
      const editedCommands = await Promise.all(
        editCommands.map(({ existCommand, newCommand }) =>
          existCommand.edit(newCommand),
        ),
      );

      registeredCommands = registeredCommands.concat(editedCommands);
    }

    // Create new commands
    if (createCommands.length !== 0) {
      const createdCommands = await this.client.application.commands.set(
        commandList,
        forGuild,
      );

      registeredCommands = registeredCommands.concat(
        Array.from(createdCommands.values()),
      );
    }

    this.logger.log(
      `All ${forGuild ? 'guild' : 'global'} commands are registered!`,
    );

    return registeredCommands;
  }
}
