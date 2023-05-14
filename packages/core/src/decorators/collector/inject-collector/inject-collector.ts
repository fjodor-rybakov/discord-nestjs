import { Inject } from '@nestjs/common';

import { CAUSE_EVENT } from '../../../providers/constants/cause-event.constant';
import { COLLECTOR } from '../../../providers/constants/collector.constant';

/**
 * Inject collector from request
 */
export function InjectCollector(): ParameterDecorator {
  return Inject(COLLECTOR);
}

/**
 * Inject an event based on which the collector was created
 */
export function InjectCauseEvent(): ParameterDecorator {
  return Inject(CAUSE_EVENT);
}
