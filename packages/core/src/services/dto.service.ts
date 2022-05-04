import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { ParamExplorer } from '../explorers/param/param.explorer';

@Injectable()
export class DtoService {
  constructor(
    private readonly paramExplorer: ParamExplorer,
    private readonly moduleRef: ModuleRef,
  ) {}

  async createDtoInstance(
    instance: InstanceType<any>,
    methodName: string,
  ): Promise<InstanceType<any>> {
    const payloadType = this.paramExplorer.getPayloadType(instance, methodName);

    if (!payloadType) return;

    return this.moduleRef.create(payloadType);
  }
}
