import { ValidationError } from '@nestjs/common';

export class WrongArgsException extends Error {
  constructor(private readonly validationError: ValidationError[]) {
    super();
  }

  getError(): ValidationError[] {
    return this.validationError;
  }
}
