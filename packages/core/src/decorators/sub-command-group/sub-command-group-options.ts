import { Type } from '@nestjs/common';

import { UseGroupOptions } from './use-group-options';

export interface SubCommandGroupOptions {
  options: UseGroupOptions;
  subCommands: Type[];
}
