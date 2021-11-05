import { ClassResolveOptions } from './class-resolve-options';

export interface ClassResolver<TReturn = unknown> {
  resolve(
    options: ClassResolveOptions,
  ): Promise<void | TReturn> | void | TReturn;
}
