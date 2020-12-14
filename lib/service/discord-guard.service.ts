import { Injectable } from '@nestjs/common';
import { DiscordGuard } from '..';
import { ClientEvents } from 'discord.js';
import { ConstructorType } from '../utils/type/constructor-type';

@Injectable()
export class DiscordGuardService {
  async applyGuards(
    guards: (DiscordGuard | ConstructorType)[],
    event: keyof ClientEvents,
    context: any[],
  ): Promise<boolean> {
    try {
      await guards.reduce(
        async (
          prev: Promise<void>,
          curr: DiscordGuard | ConstructorType,
        ) => {
          let discordGuard: DiscordGuard;
          if (typeof curr === 'function') {
            discordGuard = new curr();
          }
          await prev;
          const isCanActive = await discordGuard.canActive(event, context);
          if (!isCanActive) {
            throw new Error('Not allow');
          }
        },
        Promise.resolve(),
      );
    } catch (err) {
      return false;
    }
    return true;
  }
}
