import { DiscordResolve } from '../interface/discord-resolve';
import { ClientEvents } from 'discord.js';
import { DiscordClient, OnDecoratorOptions } from '..';
import { ONCE_DECORATOR } from '../constant/discord.constant';
import { DiscordResolveOptions } from '../interface/discord-resolve-options';
import { DiscordMiddlewareService } from '../service/discord-middleware.service';
import { Injectable } from '@nestjs/common';
import { DiscordPipeService } from '../service/discord-pipe.service';
import { DiscordGuardService } from '../service/discord-guard.service';
import { DiscordResolverHelper } from '../helper/discord-resolver.helper';

@Injectable()
export class OnceResolver implements DiscordResolve {
  constructor(
    private readonly discordMiddlewareService: DiscordMiddlewareService,
    private readonly discordPipeService: DiscordPipeService,
    private readonly discordGuardService: DiscordGuardService,
    private readonly discordResolverHelper: DiscordResolverHelper,
  ) {}

  resolve(options: DiscordResolveOptions): void {
    const { discordClient, instance, methodName, middlewareList } = options;
    const metadata = this.getDecoratorMetadata(instance, methodName);
    const pipes = this.discordResolverHelper.getPipeMetadata(
      instance,
      methodName,
    );
    const guards = this.discordResolverHelper.getGuardMetadata(
      instance,
      methodName,
    );
    if (metadata) {
      discordClient.once(
        metadata.event,
        async (...data: ClientEvents[keyof ClientEvents]) => {
          if (!this.isAllowGuild(discordClient, data)) {
            return;
          }
          if (this.isDenyGuild(discordClient, data)) {
            return;
          }
          if (guards && guards.length !== 0) {
            const isAllowFromGuards = await this.discordGuardService.applyGuards(
              guards,
              metadata.event,
              data,
            );
            if (!isAllowFromGuards) {
              return;
            }
          }
          await this.discordMiddlewareService.applyMiddleware(
            middlewareList,
            metadata.event,
            data,
          );
          if (pipes && pipes.length !== 0) {
            data = await this.discordPipeService.applyPipes(
              pipes,
              metadata.event,
              data,
            );
          }
          this.discordResolverHelper.callHandler(
            instance,
            methodName,
            data,
            metadata.event,
          );
        },
      );
    }
  }

  private isAllowGuild(
    discordClient: DiscordClient,
    data: any[] = [],
  ): boolean {
    const guild = data.find((item) => !!item && !!item.guild);
    const guildId = !!guild && guild.guild.id;
    if (!!guildId) {
      return discordClient.isAllowGuild(guildId);
    }
    return true;
  }

  private isDenyGuild(discordClient: DiscordClient, data: any[] = []): boolean {
    const guild = data.find((item) => !!item && !!item.guild);
    const guildId = !!guild && guild.guild.id;
    if (!!guildId) {
      return discordClient.isDenyGuild(guildId);
    }
    return false;
  }

  private getDecoratorMetadata(
    instance: any,
    methodName: string,
  ): OnDecoratorOptions {
    return Reflect.getMetadata(ONCE_DECORATOR, instance, methodName);
  }
}
