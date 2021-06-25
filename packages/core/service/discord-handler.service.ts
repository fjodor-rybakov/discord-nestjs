import { Injectable } from '@nestjs/common';

@Injectable()
export class DiscordHandlerService {
  async callHandler(
    instance: unknown,
    methodName: string,
    params: any,
  ): Promise<any> {
    await instance[methodName](...params);
  }
}
