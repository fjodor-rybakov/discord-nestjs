import { Type } from '@nestjs/common';
import { Constructor } from '@nestjs/common/utils/merge-with-values.util';
import { IntersectionType, MappedType } from '@nestjs/mapped-types';

export function DiscordIntersectionType<A, B>(
  target: Type<A>,
  source: Type<B>,
): MappedType<A & B>;

export function DiscordIntersectionType<A, B, C>(
  target: Type<A>,
  sourceB: Type<B>,
  sourceC: Type<C>,
): MappedType<A & B & C>;

export function DiscordIntersectionType<A, B, C, D>(
  target: Type<A>,
  sourceB: Type<B>,
  sourceC: Type<C>,
  sourceD: Type<D>,
): MappedType<A & B & C & D>;

export function DiscordIntersectionType<A, T extends Constructor<any>[]>(
  classA: Type<A>,
  ...classRefs: T
): MappedType<A> {
  const classes = [classA, ...classRefs];
  const instances = classes.map((classType) => new classType());

  const newType = IntersectionType(...[classA, ...classRefs]);

  // FIXME: Type for newType
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  class Intersection extends newType {
    constructor(...args) {
      super(...args);
      Object.assign(this, ...instances);

      instances.forEach((instance) => {
        const properties = Object.keys(instance);

        properties.map((property) => {
          Reflect.getMetadataKeys(instance, property).forEach((metadataKey) => {
            const paramMetadata = Reflect.getMetadata(
              metadataKey,
              instance,
              property,
            );

            Reflect.defineMetadata(metadataKey, paramMetadata, this, property);
          });
        });
      });
    }
  }

  return Intersection as MappedType<A>;
}
