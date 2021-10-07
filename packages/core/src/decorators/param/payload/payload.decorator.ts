import { PAYLOAD_DECORATOR } from './payload.constant';

export function Payload(): ParameterDecorator {
  return (
    target: Record<string, any>,
    propertyKey: string | symbol,
    parameterIndex: number,
  ): void => {
    Reflect.defineMetadata(
      PAYLOAD_DECORATOR,
      { parameterIndex },
      target,
      propertyKey,
    );
  };
}
