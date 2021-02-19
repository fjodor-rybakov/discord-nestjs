import { ValidationError } from 'class-validator';
import { ValidatorOptions } from 'class-validator/types/validation/ValidatorOptions';

export interface ValidationOptionsPipe {
  validatorOptions?: ValidatorOptions;
  exceptionFactory: (errors: ValidationError[], context: any) => void;
}