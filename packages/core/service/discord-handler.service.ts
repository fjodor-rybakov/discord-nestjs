import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscordHandlerService {
  callHandler(instance: unknown, methodName: string, params: any): void {
    instance[methodName](...params);
  }
}
