/**
 * Plugin that compiles typescript files
 */
export const compiler = input => {
  input.id ??= uuid()
  input.ts ??= new Date().toISOString()
}
