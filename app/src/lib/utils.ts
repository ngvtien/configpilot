// Simplify the utils.ts file to avoid dependencies
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}