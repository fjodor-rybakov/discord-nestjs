import { UseGroupOptions } from './use-group-options';
import { Type } from '@nestjs/common';

export interface SubCommandGroupOptions {
  options: UseGroupOptions;
  subCommands: Type[];
}
