export function IsObject(instance: any): instance is object {
  return typeof instance === 'object'
    ? instance !== null
    : typeof instance === 'function';
}
