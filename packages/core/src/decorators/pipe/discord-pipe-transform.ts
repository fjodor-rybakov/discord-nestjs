import { DiscordArgumentMetadata } from './discord-argument-metadata';

/**
 * Base pipe interface
 */
export interface DiscordPipeTransform<TValue = any, TReturn = any> {
  transform(
    value: TValue,
    metadata: DiscordArgumentMetadata,
  ): TReturn | Promise<TReturn>;
}
