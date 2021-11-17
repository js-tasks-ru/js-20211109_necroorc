/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function getter(obj) {
    let result;
    path
      .split('.')
      .forEach(pathChunk => !result ? result = obj[pathChunk] : result = result[pathChunk])
    return result;
  }
}
