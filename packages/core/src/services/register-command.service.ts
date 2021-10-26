import { DiscordModuleOption } from '../definitions/interfaces/discord-module-options';
import { DiscordCommandProvider } from '../providers/discord-command.provider';
import { DiscordClientService } from './discord-client.service';
import { Injectable, Logger } from '@nestjs/common';
import { Client, Message } from 'discord.js';

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
      options.autoRegisterGlobalCommands
    )
      client.on('ready', () => this.registerCommands(client, options));
  }

  private async registerCommands(
    client: Client,
    { registerCommandOptions, autoRegisterGlobalCommands }: DiscordModuleOption,
  ): Promise<void> {
    const commandList = this.discordCommandProvider.getAllCommands();
    if (commandList.length === 0) return;

    if (autoRegisterGlobalCommands) {
      await client.application.commands.set(commandList);

      this.logger.log('All global commands are registered!');
    } else {
      await Promise.all(
        registerCommandOptions.map(async ({ forGuild, allowFactory }) => {
          if (allowFactory) {
            if (forGuild) {
              // Registering commands for specific guild
              client.on('messageCreate', async (message: Message) => {
                if (!allowFactory(message, commandList)) return;

                await client.application.commands.set(commandList, forGuild);

                this.logger.log('All guild commands are registered!');
              });
            } else {
              // Registering global commands
              client.on('messageCreate', async (message: Message) => {
                if (!allowFactory(message, commandList)) return;

                await client.application.commands.set(commandList);

                this.logger.log('All global commands are registered!');
              });
            }
          } else if (forGuild) {
            // Registering commands for specific guild
            await client.application.commands.set(commandList, forGuild);

            this.logger.log('All guild commands are registered!');
          }
        }),
      );
    }
  }
}
