import { DiscordResolve } from '../interface/discord-resolve';
import { ClientEvents } from 'discord.js';
import { DiscordClient, OnDecoratorOptions } from '..';
import {
  ONCE_DECORATOR,
  USE_GUARDS_DECORATOR,
  USE_INTERCEPTORS_DECORATOR,
} from '../constant/discord.constant';
import { DiscordResolveOptions } from '../interface/discord-resolve-options';
import { DiscordMiddlewareService } from '../service/discord-middleware.service';
import { Injectable } from '@nestjs/common';
import { DiscordInterceptor } from '..';
import { DiscordInterceptorService } from '../service/discord-interceptor.service';
import { DiscordGuardService } from '../service/discord-guard.service';
import { DiscordGuard } from '..';

@Injectable()
export class OnceResolver implements DiscordResolve {
  constructor(
    private readonly discordMiddlewareService: DiscordMiddlewareService,
    private readonly discordInterceptorService: DiscordInterceptorService,
    private readonly discordGuardService: DiscordGuardService,
  ) {}

  resolve(options: DiscordResolveOptions): void {
    const { discordClient, instance, methodName, middlewareList } = options;
    const metadata = this.getDecoratorMetadata(instance, methodName);
    const interceptors = this.getInterceptorMetadata(instance, methodName);
    const guards = this.getGuardMetadata(instance, methodName);
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
          if (interceptors && interceptors.length !== 0) {
            data = await this.discordInterceptorService.applyInterceptors(
              interceptors,
              metadata.event,
              data,
            );
          }
          instance[methodName](...data);
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

  private getInterceptorMetadata(
    instance: any,
    methodName: string,
  ): (DiscordInterceptor | Function)[] {
    return Reflect.getMetadata(
      USE_INTERCEPTORS_DECORATOR,
      instance,
      methodName,
    );
  }

  private getGuardMetadata(
    instance: any,
    methodName: string,
  ): (DiscordGuard | Function)[] {
    return Reflect.getMetadata(USE_GUARDS_DECORATOR, instance, methodName);
  }
}
