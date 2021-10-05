export function IsObject(instance: any): instance is Object {
  return typeof instance === 'object'
    ? instance !== null
    : typeof instance === 'function';
}
