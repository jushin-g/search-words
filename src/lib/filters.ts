export const evaluateRegexFilter = (
  regex: RegExp,
  currentWord: string,
): string[] | undefined => {
  return regex.test(currentWord) ? [currentWord] : undefined;
};

export const evaluateDictionaryMatchFilter = (
  anagramMatch: boolean,
  dictionaryAnagramMap: Map<string, string[]>,
  currentWord: string,
  currentWordSignature: string,
  dictionarySet: Set<string>,
): string[] | undefined => {
  if (anagramMatch) {
    return dictionaryAnagramMap.get(currentWordSignature);
  }

  return dictionarySet.has(currentWord) ? [currentWord] : undefined;
};

export const evaluateReplaceCountFilter = (
  minCount: number,
  currentWord: string,
  replaceCount: number,
): string[] | undefined => {
  return replaceCount >= minCount ? [currentWord] : undefined;
};

export const evaluateLengthFilter = (
  minLength: number | undefined,
  maxLength: number | undefined,
  currentWord: string,
): string[] | undefined => {
  const length = currentWord.length;

  return (!minLength || length >= minLength) &&
    (!maxLength || length <= maxLength)
    ? [currentWord]
    : undefined;
};

export const evaluateCandidateCharsFilter = (
  candidateChars: string,
  minMatchCount: number,
  currentWord: string,
): string[] | undefined => {
  const wordChars = new Set(currentWord);
  let matched = 0;

  for (const char of candidateChars) {
    if (wordChars.has(char)) {
      matched++;
    }
  }

  return matched >= minMatchCount ? [currentWord] : undefined;
};
