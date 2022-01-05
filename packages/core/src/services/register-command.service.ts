import { Injectable, Logger } from '@nestjs/common';
import { Client, Message } from 'discord.js';

import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';
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
    const client = await this.discordClientService.getClient();

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
    }: DiscordModuleOption,
  ): Promise<void> {
    const commandList = this.discordCommandProvider.getAllCommands();
    if (commandList.length === 0) return;

    if (removeGlobalCommands) await this.dropGlobalCommands(client);

    if (autoRegisterGlobalCommands) {
      await client.application.commands.set(commandList);

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

                  await client.application.commands.set(commandList, forGuild);

                  this.logger.log('All guild commands are registered!');
                });
              } else {
                // Registering global commands
                client.on('messageCreate', async (message: Message) => {
                  if (!allowFactory(message, commandList)) return;

                  if (removeCommandsBefore)
                    await this.dropGlobalCommands(client);

                  await client.application.commands.set(commandList);

                  this.logger.log('All global commands are registered!');
                });
              }
            } else if (forGuild) {
              if (removeCommandsBefore)
                await this.dropLocalCommands(client, forGuild);

              // Registering commands for specific guild
              await client.application.commands.set(commandList, forGuild);

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
}
