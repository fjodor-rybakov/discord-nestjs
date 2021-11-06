import { InteractionCollector, On, Once } from '@discord-nestjs/core';

@InteractionCollector({ time: 15000 })
export class PostInteractionCollector {
  @On('collect')
  onCollect(): void {
    console.log('collect');
  }

  @Once('end')
  onEnd(): void {
    console.log('end');
  }
}
