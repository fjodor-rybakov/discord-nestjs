import { ConstructorType, DiscordPipeTransform } from '../../core';
import { ClientEvents } from 'discord.js';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { ValidationOptionsPipe } from './interface/validation-options.pipe';
import { validate } from 'class-validator';
import { ValidationProvider } from '../../core/provider/validation.provider';

@Injectable()
export class ValidationPipe implements DiscordPipeTransform {
  @Inject(ValidationProvider)
  validationProvider: ValidationProvider;

  constructor(
    @Optional()
    private readonly validateOptions?: ValidationOptionsPipe
  ) {
  }

  async transform(event: keyof ClientEvents, context: any, content?: any, type?: ConstructorType): Promise<any> {
    const result = await validate(content, this.validateOptions?.validatorOptions);
    if (this.validateOptions && this.validateOptions.exceptionFactory) {
      this.validationProvider.setErrorMessage(this.validateOptions.exceptionFactory(result, context));
    }
    if (result.length > 0) {
      throw result;
    }
    return content;
  }
}