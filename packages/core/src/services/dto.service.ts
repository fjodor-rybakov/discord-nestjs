import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ParamResolver } from '../resolvers/param/param.resolver';

@Injectable()
export class DtoService {
  constructor(
    private readonly paramResolver: ParamResolver,
    private readonly moduleRef: ModuleRef,
  ) {}

  async createDtoInstance(
    instance: InstanceType<any>,
    methodName: string,
  ): Promise<InstanceType<any>> {
    this.paramResolver.resolve({ instance, methodName });
    const payloadType = this.paramResolver.getPayloadType({
      instance,
      methodName,
    });

    if (!payloadType) return;

    return this.moduleRef.create(payloadType);
  }
}
