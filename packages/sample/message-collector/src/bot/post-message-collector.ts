import { MessageCollector, On, Once } from '@discord-nestjs/core';

@MessageCollector({ time: 15000 })
export class PostMessageCollector {
  @On('collect')
  onCollect(): void {
    console.log('collect');
  }

  @Once('end')
  onEnd(): void {
    console.log('end');
  }
}
