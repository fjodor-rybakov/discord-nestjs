import { Injectable } from '@nestjs/common';
import { ReflectMetadataProvider } from '../provider/reflect-metadata.provider';
import { DiscordClientProvider } from '../provider/discord-client-provider';
import { ClassResolveOptions } from './interface/class-resolve-options';

@Injectable()
export class ClientResolver {
  constructor(
    private readonly metadataProvider: ReflectMetadataProvider,
    private readonly discordClientProvider: DiscordClientProvider,
  ) {
  }

  resolve(options: ClassResolveOptions): void {
    const { instance } = options;
    for (const propertyKey in instance) {
      const metadata = this.metadataProvider.getClientDecoratorMetadata(instance, propertyKey);
      if (metadata) {
        instance[propertyKey] = this.discordClientProvider;
      }
    }
  }
}