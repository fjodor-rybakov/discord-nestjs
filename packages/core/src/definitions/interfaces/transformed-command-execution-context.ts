import {
  ChatInputCommandInteraction,
  CollectedInteraction,
  ContextMenuCommandInteraction,
} from 'discord.js';

import { CommandExecutionContext } from './command-execution-context';

export interface TransformedCommandExecutionContext<
  TInteraction extends CollectedInteraction = any,
> extends CommandExecutionContext<TInteraction> {
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction;
}
