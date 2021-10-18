import { DiscordArgumentMetadata } from './discord-argument-metadata';

/**
 * Base pipe interface
 *
 * Pipes should be implemented on its basis
 */
export interface DiscordPipeTransform<TValue = any, TReturn = any> {
  transform(
    value: TValue,
    metadata: DiscordArgumentMetadata,
  ): TReturn | Promise<TReturn>;
}
