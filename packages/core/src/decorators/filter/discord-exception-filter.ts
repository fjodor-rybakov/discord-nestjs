import { DiscordArgumentMetadata } from '../pipe/discord-argument-metadata';

/**
 * Exception filter
 */
export interface DiscordExceptionFilter<TException = any> {
  catch(
    exception: TException,
    metadata: DiscordArgumentMetadata,
  ): Promise<void> | void;
}
