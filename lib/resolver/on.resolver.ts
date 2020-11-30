import { DiscordResolve } from '../interface/discord-resolve';
import { ClientEvents } from 'discord.js';
import { ON_DECORATOR } from '../constant/discord.constant';
import { DiscordClient, OnDecoratorOptions } from '..';
import { DiscordResolveOptions } from '../interface/discord-resolve-options';
import { DiscordMiddlewareService } from '../service/discord-middleware.service';
import { Injectable } from '@nestjs/common';
import { DiscordInterceptorService } from '../service/discord-interceptor.service';
import { DiscordGuardService } from '../service/discord-guard.service';
import { DiscordResolverHelper } from '../helper/discord-resolver.helper';

@Injectable()
export class OnResolver implements DiscordResolve {
  constructor(
    private readonly discordMiddlewareService: DiscordMiddlewareService,
    private readonly discordInterceptorService: DiscordInterceptorService,
    private readonly discordGuardService: DiscordGuardService,
    private readonly discordResolverHelper: DiscordResolverHelper,
  ) {}

  resolve(options: DiscordResolveOptions): void {
    const { discordClient, instance, methodName, middlewareList } = options;
    const metadata = this.getDecoratorMetadata(instance, methodName);
    const interceptors = this.discordResolverHelper.getInterceptorMetadata(
      instance,
      methodName,
    );
    const guards = this.discordResolverHelper.getGuardMetadata(
      instance,
      methodName,
    );
    if (metadata) {
      discordClient.on(
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
          if (interceptors && interceptors.length !== 0) {
            data = await this.discordInterceptorService.applyInterceptors(
              interceptors,
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
    return Reflect.getMetadata(ON_DECORATOR, instance, methodName);
  }
}
