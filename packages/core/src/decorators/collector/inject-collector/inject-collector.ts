import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

/**
 * Inject collector from request
 */
export function InjectCollector() {
  return Inject(REQUEST);
}
