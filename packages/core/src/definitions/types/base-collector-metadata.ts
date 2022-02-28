import { CollectorMetadata } from '../../resolvers/collector/collector-metadata';

export type BaseCollectorMetadata = Omit<
  CollectorMetadata,
  'metadata' | 'type'
>;
