import { Interaction, InteractionCollectorOptions } from 'discord.js';

export type DiscordInteractionCollectorOptions<
  TInteraction extends Interaction,
> = Omit<InteractionCollectorOptions<TInteraction>, 'filter'>;
