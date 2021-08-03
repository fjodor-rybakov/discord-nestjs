import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordGuard } from 'discord-nestjs';
import { ClientEvents, Message, MessageEmbed } from 'discord.js';

@Injectable()
export class AdminGuard implements DiscordGuard {
  constructor(private readonly configService: ConfigService) {}

  async canActive(
    event: keyof ClientEvents,
    [context]: [Message],
  ): Promise<boolean> {
    const userHasPermission = context.member.roles.cache.has(
      this.configService.get('ADMIN_ROLE_ID'),
    );
    if (!userHasPermission) {
      const embed = new MessageEmbed()
        .setColor('RED')
        .setTitle('Ups! Not allowed!');
      await context.reply(embed);
    }
    return userHasPermission;
  }
}
