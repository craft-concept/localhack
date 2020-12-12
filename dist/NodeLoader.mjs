// .localhack/build/entries/NodeLoader.mjs
var ROOT = process.cwd();
function resolve(specifier, {conditions, parentURL}, defaultResolve) {
  console.log("resolving:", specifier);
  return defaultResolve(specifier, {conditions, parentURL}, defaultResolve);
}
export {
  resolve
};
