import { getDictionarySet, resolveDictionaryPath } from "@/lib/dictionaries";
import {
  parseConditions,
  ParsedFilterCondition,
  ParsedTransformCondition,
  type ParsedSearchCondition,
} from "@/lib/conditions";
import {
  evaluateCandidateCharsFilter,
  evaluateDictionaryMatchFilter,
  evaluateLengthFilter,
  evaluateRegexFilter,
  evaluateReplaceCountFilter,
} from "@/lib/filters";
import {
  applyRegexTransform,
  applySortTransform,
  applyCharReplaceTransform,
  applyRomajiTransform,
  toSortedSignature,
} from "@/lib/transforms";
import { assertNever } from "@/lib/utils";
import type {
  SearchRequestPayload,
  SearchResponse,
  SearchResultRow,
} from "@/lib/types";

type EvaluateWordResult = {
  currentWord: string;
  currentWordSignature: string;
  stageTail: StageNode | null;
  replaceCount: number;
};

type StageNode = {
  value: string;
  prev: StageNode | null;
};

type DictionaryContext = {
  dictionarySet: Set<string>;
  dictionaryAnagramMap: Map<string, string[]>;
};

const appendStage = (tail: StageNode | null, value: string): StageNode => {
  return {
    value,
    prev: tail,
  };
};

const stageTailToArray = (tail: StageNode | null): string[] => {
  if (!tail) {
    return [];
  }

  const stages: string[] = [];
  let currentNode: StageNode | null = tail;

  while (currentNode) {
    stages.push(currentNode.value);
    currentNode = currentNode.prev;
  }

  return stages.reverse();
};

const buildAnagramMap = (dictionarySet: Set<string>): Map<string, string[]> => {
  const map = new Map<string, string[]>();

  for (const dictionaryWord of dictionarySet) {
    const signature = toSortedSignature(dictionaryWord);
    const words = map.get(signature);
    if (words) {
      words.push(dictionaryWord);
      continue;
    }
    map.set(signature, [dictionaryWord]);
  }

  return map;
};

const createNextResult = (
  result: EvaluateWordResult,
  nextWord: string,
  replaceCountIncrement: number,
): EvaluateWordResult => {
  return {
    currentWord: nextWord,
    currentWordSignature:
      nextWord === result.currentWord
        ? result.currentWordSignature
        : toSortedSignature(nextWord),
    stageTail: appendStage(result.stageTail, nextWord),
    replaceCount: result.replaceCount + replaceCountIncrement,
  };
};

const applyFilterCondition = (
  resultList: EvaluateWordResult[],
  condition: ParsedFilterCondition,
  dictionaryContexts: Map<string, DictionaryContext>,
): EvaluateWordResult[] => {
  const nextResultList: EvaluateWordResult[] = [];
  const { filterType } = condition;
  const isAnagramDictionaryMatch =
    filterType === "dictionaryMatch" && condition.anagramMatch;

  for (const result of resultList) {
    let candidates: string[] | undefined;

    switch (filterType) {
      case "regex": {
        candidates = evaluateRegexFilter(condition.regex, result.currentWord);
        break;
      }
      case "dictionaryMatch": {
        const dictionaryContext = dictionaryContexts.get(condition.file);
        if (!dictionaryContext) {
          throw new Error(`Dictionary not found: ${condition.file}`);
        }

        candidates = evaluateDictionaryMatchFilter(
          condition.anagramMatch,
          dictionaryContext.dictionaryAnagramMap,
          result.currentWord,
          result.currentWordSignature,
          dictionaryContext.dictionarySet,
        );
        break;
      }
      case "replaceCount": {
        candidates = evaluateReplaceCountFilter(
          condition.minCount,
          result.currentWord,
          result.replaceCount,
        );
        break;
      }
      case "length": {
        candidates = evaluateLengthFilter(
          condition.minLength,
          condition.maxLength,
          result.currentWord,
        );
        break;
      }
      case "candidateChars": {
        candidates = evaluateCandidateCharsFilter(
          condition.candidateChars,
          condition.minMatchCount,
          result.currentWord,
        );
        break;
      }
      default:
        assertNever(filterType);
    }

    if (!candidates?.length) {
      continue;
    }

    if (!isAnagramDictionaryMatch) {
      nextResultList.push(result);
      continue;
    }

    for (const candidate of candidates) {
      const nextResult = createNextResult(
        result,
        candidate,
        candidate === result.currentWord ? 0 : 1,
      );
      nextResultList.push(nextResult);
    }
  }

  return nextResultList;
};

const applyTransformCondition = (
  resultList: EvaluateWordResult[],
  condition: ParsedTransformCondition,
): EvaluateWordResult[] => {
  const nextResultList: EvaluateWordResult[] = [];
  const { transformType } = condition;

  for (const result of resultList) {
    switch (transformType) {
      case "regexReplace": {
        const transform = applyRegexTransform(
          result.currentWord,
          condition.regex,
          condition.to,
        );
        if (condition.matchOnly && transform.replaceCountIncrement === 0) {
          break;
        }

        nextResultList.push(
          createNextResult(
            result,
            transform.newWord,
            transform.replaceCountIncrement,
          ),
        );
        break;
      }
      case "sort": {
        const transform = applySortTransform(result.currentWord);
        nextResultList.push(
          createNextResult(
            result,
            transform.newWord,
            transform.replaceCountIncrement,
          ),
        );
        break;
      }
      case "smallToLarge": {
        const transform = applyCharReplaceTransform(
          result.currentWord,
          "smallToLarge",
        );
        nextResultList.push(
          createNextResult(
            result,
            transform.newWord,
            transform.replaceCountIncrement,
          ),
        );
        break;
      }
      case "voicedToUnvoiced": {
        const transform = applyCharReplaceTransform(
          result.currentWord,
          "voicedToUnvoiced",
        );
        nextResultList.push(
          createNextResult(
            result,
            transform.newWord,
            transform.replaceCountIncrement,
          ),
        );
        break;
      }
      case "romaji": {
        const transform = applyRomajiTransform(
          result.currentWord,
          condition.longVowel,
        );
        nextResultList.push(
          createNextResult(
            result,
            transform.newWord,
            transform.replaceCountIncrement,
          ),
        );
        break;
      }
      default:
        assertNever(transformType);
    }
  }

  return nextResultList;
};

const evaluateWord = (
  word: string,
  parsedConditions: ParsedSearchCondition[],
  dictionaryContexts: Map<string, DictionaryContext>,
): EvaluateWordResult[] => {
  let resultList: EvaluateWordResult[] = [
    {
      currentWord: word,
      currentWordSignature: toSortedSignature(word),
      stageTail: null,
      replaceCount: 0,
    },
  ];

  for (const condition of parsedConditions) {
    const nextResultList =
      condition.category === "filter"
        ? applyFilterCondition(resultList, condition, dictionaryContexts)
        : applyTransformCondition(resultList, condition);

    if (nextResultList.length === 0) {
      return [];
    }

    resultList = nextResultList;
  }

  return resultList;
};

export const runSearch = async (
  payload: SearchRequestPayload,
): Promise<SearchResponse> => {
  const dictionaryContexts = new Map<string, DictionaryContext>();

  const defaultFile = String(payload.file || "");
  const defaultDictionarySet = await getDictionarySet(
    resolveDictionaryPath(defaultFile),
  );
  dictionaryContexts.set(defaultFile, {
    dictionarySet: defaultDictionarySet,
    dictionaryAnagramMap: buildAnagramMap(defaultDictionarySet),
  });

  const parsedConditions = parseConditions(payload.conditions || []);
  const additionalFiles = parsedConditions
    .filter(
      (condition) =>
        condition.category === "filter" &&
        condition.filterType === "dictionaryMatch",
    )
    .map((condition) => condition.file);

  for (const file of additionalFiles) {
    if (dictionaryContexts.has(file)) {
      continue;
    }

    const dictionarySet = await getDictionarySet(resolveDictionaryPath(file));
    dictionaryContexts.set(file, {
      dictionarySet,
      dictionaryAnagramMap: buildAnagramMap(dictionarySet),
    });
  }

  const transformColumns = parsedConditions.flatMap((condition) => {
    if (condition.category === "transform") {
      switch (condition.transformType) {
        case "regexReplace":
          return `${condition.from} → ${condition.to}`;
        case "sort":
          return "ソート";
        case "smallToLarge":
          return "小→大";
        case "voicedToUnvoiced":
          return "濁→清";
        case "romaji":
          return "ローマ字";
        default:
          return assertNever(condition);
      }
    }

    if (condition.filterType === "dictionaryMatch" && condition.anagramMatch) {
      return "アナグラム";
    }

    return [];
  });

  const results: SearchResultRow[] = [];
  for (const word of defaultDictionarySet) {
    if (!word) {
      continue;
    }

    const evalResults = evaluateWord(
      word,
      parsedConditions,
      dictionaryContexts,
    );
    if (evalResults.length === 0) {
      continue;
    }

    for (const evalResult of evalResults) {
      results.push({
        original: word,
        stages: stageTailToArray(evalResult.stageTail),
        replaceCount: evalResult.replaceCount,
      });
    }
  }

  return {
    matched: results.length,
    transformColumns,
    results,
  };
};
