import { ClientEvents } from "discord.js";

/**
 * Base interceptor interface
 */
export interface DiscordInterceptor<T = any> {
  intercept(
    event: keyof ClientEvents,
    context: T
  ): any | Promise<any>;
}
