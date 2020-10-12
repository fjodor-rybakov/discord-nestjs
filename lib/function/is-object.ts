export function IsObject(instance: any): boolean {
  return typeof instance === "object" ? instance !== null : typeof instance === "function";
}