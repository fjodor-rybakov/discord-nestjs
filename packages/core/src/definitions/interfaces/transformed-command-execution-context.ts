import { CommandInteraction, Interaction } from 'discord.js';

import { CommandExecutionContext } from './command-execution-context';

export interface TransformedCommandExecutionContext<
  TInteraction extends Interaction = any,
> extends CommandExecutionContext<TInteraction> {
  interaction: CommandInteraction;
}
