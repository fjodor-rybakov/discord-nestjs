import { CollectorProvider, EventContext } from '@discord-nestjs/core';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Message } from 'discord.js';
import { Observable } from 'rxjs';

@Injectable()
export class CollectorInterceptor implements NestInterceptor {
  constructor(private readonly collectorInterceptor: CollectorProvider) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const classType = context.getClass();
    const methodName = context.getHandler().name;
    const eventArgs = context.getArgs<[message: Message]>();
    const eventContext = context.getArgByIndex<EventContext>(
      context.getArgs().length - 1,
    );

    eventContext.collectors = await this.collectorInterceptor.applyCollector({
      classType,
      methodName,
      event: eventContext.event,
      eventArgs,
    });

    return next.handle();
  }
}
