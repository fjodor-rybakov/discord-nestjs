import { PipeTransform } from '@nestjs/common';
import { ParamData } from '@nestjs/common/decorators/http/route-params.decorator';
import { Type } from '@nestjs/common/interfaces';

export interface ParamTypeOptions {
  [x: string]: {
    index: number;
    data: ParamData;
    pipes: (PipeTransform | Type<PipeTransform>)[];
  };
}
