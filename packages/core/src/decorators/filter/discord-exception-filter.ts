import { DiscordArgumentMetadata } from '../pipe/discord-argument-metadata';

/**
 * Exception filter interface
 *
 * Filters should be implemented on its basis
 */
export interface DiscordExceptionFilter<TException = any> {
  catch(
    exception: TException,
    metadata: DiscordArgumentMetadata,
  ): Promise<void> | void;
}
