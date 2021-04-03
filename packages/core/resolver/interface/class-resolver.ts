import { ClassResolveOptions } from './class-resolve-options';

export interface ClassResolver {
  resolve(options: ClassResolveOptions): Promise<void> | void;
}