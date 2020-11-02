import { Injectable } from '@nestjs/common';
import { DiscordGuard } from '..';
import { ClientEvents, Message } from 'discord.js';
import { ConstructorType } from '../utils/type/constructor-type';

@Injectable()
export class DiscordGuardService {
  async applyGuards(
    guards: (DiscordGuard | ConstructorType)[],
    event: keyof ClientEvents,
    context: any,
  ): Promise<boolean> {
    try {
      await guards.reduce(
        async (
          prev: Promise<Message>,
          curr: DiscordGuard | ConstructorType,
        ) => {
          let discordGuard: DiscordGuard;
          if (typeof curr === 'function') {
            discordGuard = new curr();
          }
          const prevData = await prev;
          const isCanActive = await discordGuard.canActive(event, prevData);
          if (!isCanActive) {
            throw new Error('Not allow');
          }
        },
        Promise.resolve(context),
      );
    } catch (err) {
      return false;
    }
    return true;
  }
}
