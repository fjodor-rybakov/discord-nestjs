import { Collector } from 'discord.js';

export interface ExecutionContext {
  collectors: Collector<any, any>[];
}
