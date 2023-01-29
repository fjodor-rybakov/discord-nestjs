import { Injectable, Optional, PipeTransform } from '@nestjs/common';
import { ValidatorOptions, validate } from 'class-validator';

import { WrongArgsException } from '../exceptions/wrong-args.exception';

/**
 * Validates DTO with class-validator
 */
@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(
    @Optional()
    private readonly validatorOptions?: ValidatorOptions,
  ) {}

  async transform(dtoInstance: object): Promise<any> {
    const result = await validate(dtoInstance, this.validatorOptions);

    if (result.length > 0) throw new WrongArgsException(result);

    return dtoInstance;
  }
}
