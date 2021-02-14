import { DiscordMiddleware } from '../../decorator/interface/discord-middleware';
import { MiddlewareOptions } from '../../decorator/interface/middleware-options';

export class DiscordMiddlewareInstance {
  instance: DiscordMiddleware;
  metadata: MiddlewareOptions;
}
