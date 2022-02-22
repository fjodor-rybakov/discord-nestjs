import { Collection } from '@discordjs/collection';
import { Injectable, Logger, Type } from '@nestjs/common';
import { Snowflake } from 'discord-api-types';
import {
  ApplicationCommand,
  ApplicationCommandData,
  Client,
  Message,
} from 'discord.js';

import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';
import { SlashCommandPermissions } from '../definitions/interfaces/slash-command-permissions';
import { DiscordCommandProvider } from '../providers/discord-command.provider';
import { DiscordClientService } from './discord-client.service';

@Injectable()
export class RegisterCommandService {
  private readonly logger = new Logger(RegisterCommandService.name);

  constructor(
    private readonly discordCommandProvider: DiscordCommandProvider,
    private readonly discordClientService: DiscordClientService,
  ) {}

  async register(options: DiscordModuleOption): Promise<void> {
    const client = this.discordClientService.getClient();

    if (
      (options.registerCommandOptions &&
        options.registerCommandOptions.length !== 0) ||
      options.autoRegisterGlobalCommands ||
      options.removeGlobalCommands
    )
      client.on('ready', () => this.registerCommands(client, options));
  }

  private async registerCommands(
    client: Client,
    {
      registerCommandOptions,
      autoRegisterGlobalCommands,
      removeGlobalCommands,
      slashCommandsPermissions,
    }: DiscordModuleOption,
  ): Promise<void> {
    const commands = this.discordCommandProvider.getAllCommands();

    if (commands.size === 0) return;

    const commandList = Array.from(commands.values());

    if (!client.application?.owner) await client.application?.fetch();

    if (removeGlobalCommands) await this.dropGlobalCommands(client);

    if (autoRegisterGlobalCommands) {
      const registeredCommands = await client.application.commands.set(
        commandList,
      );

      if (slashCommandsPermissions)
        await this.setPermissions(
          registeredCommands,
          commands,
          slashCommandsPermissions,
        );

      this.logger.log('All global commands are registered!');
    } else {
      await Promise.all(
        registerCommandOptions.map(
          async ({ forGuild, allowFactory, removeCommandsBefore }) => {
            if (allowFactory) {
              if (forGuild) {
                // Registering commands for specific guild
                client.on('messageCreate', async (message: Message) => {
                  if (!allowFactory(message, commandList)) return;

                  if (removeCommandsBefore)
                    await this.dropLocalCommands(client, forGuild);

                  const registeredCommands =
                    await client.application.commands.set(
                      commandList,
                      forGuild,
                    );

                  if (slashCommandsPermissions)
                    await this.setPermissions(
                      registeredCommands,
                      commands,
                      slashCommandsPermissions,
                    );

                  this.logger.log('All guild commands are registered!');
                });
              } else {
                // Registering global commands
                client.on('messageCreate', async (message: Message) => {
                  if (!allowFactory(message, commandList)) return;

                  if (removeCommandsBefore)
                    await this.dropGlobalCommands(client);

                  const registeredCommands =
                    await client.application.commands.set(commandList);

                  if (slashCommandsPermissions)
                    await this.setPermissions(
                      registeredCommands,
                      commands,
                      slashCommandsPermissions,
                    );

                  this.logger.log('All global commands are registered!');
                });
              }
            } else if (forGuild) {
              if (removeCommandsBefore)
                await this.dropLocalCommands(client, forGuild);

              // Registering commands for specific guild
              const registeredCommands = await client.application.commands.set(
                commandList,
                forGuild,
              );

              if (slashCommandsPermissions)
                await this.setPermissions(
                  registeredCommands,
                  commands,
                  slashCommandsPermissions,
                );

              this.logger.log('All guild commands are registered!');
            }
          },
        ),
      );
    }
  }

  private async dropGlobalCommands(client: Client): Promise<void> {
    const globalCommands = await client.application.commands.fetch();
    await Promise.all(globalCommands.map((command) => command.delete()));

    this.logger.log('All global commands removed!');
  }

  private async dropLocalCommands(
    client: Client,
    guildId: string,
  ): Promise<void> {
    const localCommands = await client.application.commands.fetch({ guildId });
    await Promise.all(localCommands.map((command) => command.delete()));

    this.logger.log('All local commands removed!');
  }

  private async setPermissions(
    registeredCommands: Collection<Snowflake, ApplicationCommand>,
    rowCommandsData: Map<Type, ApplicationCommandData>,
    slashCommandsPermissions: SlashCommandPermissions[],
  ) {
    await Promise.all(
      slashCommandsPermissions.map(
        async ({ commandClassType, permissions }) => {
          const commandData = rowCommandsData.get(commandClassType);
          const command = registeredCommands.find(
            (command) => command.name === commandData.name,
          );

          await command.permissions.set({ permissions });
        },
      ),
    );
  }
}
