import { Injectable } from '@nestjs/common';
import { GuardResolver } from './guard.resolver';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { DiscordService } from '../service/discord.service';
import { DiscordHandlerService } from '../service/discord-handler.service';
import { DiscordAccessService } from '../service/discord-access.service';
import { MiddlewareResolver } from './middleware.resolver';
import { PipeResolver } from './pipe.resolver';
import { ParamResolver } from './param.resolver';
import { MethodResolveOptions } from './interface/method-resolve-options';
import { ClientEvents } from 'discord.js';

@Injectable()
export class OnMessageResolver {
  constructor(
    private readonly guardResolver: GuardResolver,
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordService: DiscordService,
    private readonly discordHandlerService: DiscordHandlerService,
    private readonly discordAccessService: DiscordAccessService,
    private readonly middlewareResolver: MiddlewareResolver,
    private readonly pipeResolver: PipeResolver,
    private readonly paramResolver: ParamResolver,
  ) {}

  resolve(options: MethodResolveOptions): void {
    const { instance, methodName } = options;
    const metadata = this.metadataProvider.getOnMessageDecoratorMetadata(instance, methodName);
    if (!metadata) {
      return;
    }
    const {event} = metadata;
    this.discordService.getClient().on(event, async (...data: ClientEvents[keyof ClientEvents]) => {
      //#region check allow handle message
      if (!this.discordAccessService.isAllowGuild(data)) {
        return;
      }
      if (this.discordAccessService.isDenyGuild(data)) {
        return;
      }
      //#endregion

      //#region apply middleware, guard, pipe
      const context = data;
      await this.middlewareResolver.applyMiddleware(event, context);
      const isAllowFromGuards = await this.guardResolver.applyGuard({
        instance,
        methodName,
        event,
        context
      });
      if (!isAllowFromGuards) {
        return;
      }
      await this.pipeResolver.applyPipe({
        instance,
        methodName,
        event,
        context
      });
      //#endregion

      const argsFromDecorator = this.paramResolver.applyParam({
        instance,
        methodName,
        context
      });
      const handlerArgs = argsFromDecorator ?? context;
      this.discordHandlerService.callHandler(
        instance,
        methodName,
        handlerArgs
      );
    });
  }
}