import { Injectable } from '@nestjs/common';
import { DiscordGuard } from '..';
import { ClientEvents, Message } from 'discord.js';

@Injectable()
export class DiscordGuardService {
  async applyGuards(
    guards: (DiscordGuard | Function)[],
    event: keyof ClientEvents,
    context: any,
  ): Promise<boolean> {
    try {
      console.log('call');
      await guards.reduce(
        async (prev: Promise<Message>, curr: DiscordGuard | Function) => {
          let discordGuard: DiscordGuard;
          if (typeof curr === 'function') {
            // @ts-ignore
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
