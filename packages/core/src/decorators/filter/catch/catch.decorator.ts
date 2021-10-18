import { Type } from '@nestjs/common/interfaces';
import { CATCH_EXCEPTION_FILTER_DECORATOR } from './catch.constant';

export function Catch(...exceptions: Type[]): ClassDecorator {
  return <TFunction extends Function>(target: TFunction): TFunction | void => {
    Reflect.defineMetadata(
      CATCH_EXCEPTION_FILTER_DECORATOR,
      exceptions,
      target.prototype,
    );

    return target;
  };
}
