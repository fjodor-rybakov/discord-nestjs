import { CommandExecutionContext } from './command-execution-context';
import { CommandInteraction, Interaction } from 'discord.js';

export interface TransformedCommandExecutionContext<
  TInteraction extends Interaction = any,
> extends CommandExecutionContext<TInteraction> {
  interaction: CommandInteraction;
}
