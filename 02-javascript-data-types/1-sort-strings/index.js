/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrClone = [...arr];
  const locales = ['ru', 'en'];
  const collatorOptions = { caseFirst: 'upper' };
  switch (param) {
    case 'asc':
      return arrClone.sort((a, b) =>
        a.localeCompare(b, locales, collatorOptions));
    case 'desc':
      return arrClone.sort((a, b) =>
        b.localeCompare(a, locales, collatorOptions));
  }
}
