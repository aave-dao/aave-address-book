import {ABI_INTERFACES} from 'scripts/configs/abis';

export function generateABIImports() {
  const jsExports: string[] = [];
  for (const {name} of ABI_INTERFACES) {
    jsExports.push(`export {${name}_ABI} from './${name}';`);
  }
  return jsExports;
}
