/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let resultArr = [];
  let count;
  let cachedCodePoint;
  let letterLimit;
  function assistant(letter) {
    if (letter.codePointAt(0) !== cachedCodePoint) {
      count = 0;
    }
    cachedCodePoint = letter.codePointAt(0);
    letterLimit = cachedCodePoint * size;
    if (count === letterLimit) {
      return;
    }
    count += cachedCodePoint;
    resultArr.push(letter);
  }
  for (const letter of string) {
    assistant(letter);
  }
return resultArr.join('')
}
