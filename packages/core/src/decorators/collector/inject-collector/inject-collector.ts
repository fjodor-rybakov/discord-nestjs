import { Inject } from '@nestjs/common';

import { CAUSE_EVENT } from '../../../providers/constants/cause-event.constant';
import { COLLECTOR } from '../../../providers/constants/collector.constant';

/**
 * Inject collector from request
 */
export function InjectCollector() {
  return Inject(COLLECTOR);
}

/**
 * Inject an event based on which the collector was created
 */
export function InjectCauseEvent() {
  return Inject(CAUSE_EVENT);
}
