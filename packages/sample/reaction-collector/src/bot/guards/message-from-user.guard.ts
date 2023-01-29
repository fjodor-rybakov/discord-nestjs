import { CanActivate, ExecutionContext } from '@nestjs/common';

export class MessageFromUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const message = context.getArgByIndex(0);

    return !message.author.bot;
  }
}
