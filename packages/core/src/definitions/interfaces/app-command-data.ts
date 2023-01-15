import { ApplicationCommandData } from 'discord.js';

import { AdditionalCommandOptions } from '../../decorators/command/additional-command-options';

export interface AppCommandData {
  commandData: ApplicationCommandData;

  additionalOptions: AdditionalCommandOptions;
}
