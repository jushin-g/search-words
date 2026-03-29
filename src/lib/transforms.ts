import {
  ROMAJI_DIGRAPH_MAP,
  ROMAJI_SINGLE_MAP,
  SMALL_TO_LARGE_MAP,
  VOICED_TO_UNVOICED_MAP,
} from "@/constants.ts/transforms";

export type TransformResult = {
  newWord: string;
  replaceCountIncrement: number;
};

export const toSortedSignature = (word: string): string => {
  return Array.from(word).sort().join("");
};

export const applyRegexTransform = (
  currentWord: string,
  regex: RegExp,
  to: string,
): TransformResult => {
  const newWord = currentWord.replace(regex, to);
  const replaceCountIncrement = newWord !== currentWord ? 1 : 0;
  return {
    newWord,
    replaceCountIncrement,
  };
};

export const applySortTransform = (currentWord: string): TransformResult => {
  const newWord = toSortedSignature(currentWord);
  const replaceCountIncrement = newWord !== currentWord ? 1 : 0;
  return { newWord, replaceCountIncrement };
};

export const applyCharReplaceTransform = (
  currentWord: string,
  replaceType: "smallToLarge" | "voicedToUnvoiced",
): TransformResult => {
  const map =
    replaceType === "smallToLarge"
      ? SMALL_TO_LARGE_MAP
      : VOICED_TO_UNVOICED_MAP;
  const newWord = Array.from(currentWord)
    .map((ch) => map.get(ch) ?? ch)
    .join("");
  const replaceCountIncrement = newWord !== currentWord ? 1 : 0;
  return { newWord, replaceCountIncrement };
};

const toRomajiUnit = (
  chars: string[],
  index: number,
): { romaji: string; consumed: number } => {
  const current = chars[index] ?? "";
  const next = chars[index + 1] ?? "";
  const digraph = ROMAJI_DIGRAPH_MAP.get(`${current}${next}`);

  if (digraph) {
    return { romaji: digraph, consumed: 2 };
  }

  return {
    romaji: ROMAJI_SINGLE_MAP.get(current) ?? "",
    consumed: 1,
  };
};

export const applyRomajiTransform = (
  currentWord: string,
  longVowel: boolean,
): TransformResult => {
  const chars = Array.from(currentWord);
  let romaji = "";
  let index = 0;

  while (index < chars.length) {
    const current = chars[index];

    if (current === "ー") {
      const lastChar = romaji[romaji.length - 1] ?? "";
      romaji += longVowel && /^[aeiou]$/.test(lastChar) ? lastChar : "";
      index++;
      continue;
    }

    if (current === "っ") {
      const nextUnit = toRomajiUnit(chars, index + 1);
      const firstConsonant = /^[bcdfghjklmnpqrstvwxyz]/.exec(nextUnit.romaji);
      romaji += firstConsonant?.[0] ?? "";
      index++;
      continue;
    }

    const unit = toRomajiUnit(chars, index);
    romaji += unit.romaji;
    index += unit.consumed;
  }

  const replaceCountIncrement = romaji !== currentWord ? 1 : 0;
  return { newWord: romaji, replaceCountIncrement };
};
