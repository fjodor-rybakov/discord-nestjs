import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

export class MessageToUpperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message = context.getArgByIndex(0);

    message.content = message.content.toUpperCase();

    return next.handle();
  }
}
