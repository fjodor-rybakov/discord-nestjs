import { CanActivate, ExecutionContext } from '@nestjs/common';
import { InteractionType } from 'discord.js';

export class IsModalInteractionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const interaction = context.getArgByIndex(0);

    return interaction.type === InteractionType.ModalSubmit;
  }
}
