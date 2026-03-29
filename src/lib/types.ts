export type FilterRegexCondition = {
  category: "filter";
  filterType: "regex";
  pattern: string;
};

export type FilterDictionaryMatchCondition = {
  category: "filter";
  filterType: "dictionaryMatch";
  anagramMatch: boolean;
  file: string;
};

export type FilterReplaceCountCondition = {
  category: "filter";
  filterType: "replaceCount";
  minCount: number;
};

export type FilterLengthCondition = {
  category: "filter";
  filterType: "length";
  minLength?: number;
  maxLength?: number;
};

export type FilterCandidateCharsCondition = {
  category: "filter";
  filterType: "candidateChars";
  candidateChars: string;
  minMatchCount: number;
};

export type TransformRegexReplaceCondition = {
  category: "transform";
  transformType: "regexReplace";
  from: string;
  to: string;
  matchOnly: boolean;
};

export type TransformSortCondition = {
  category: "transform";
  transformType: "sort";
};

export type TransformSmallToLargeCondition = {
  category: "transform";
  transformType: "smallToLarge";
};

export type TransformVoicedToUnvoicedCondition = {
  category: "transform";
  transformType: "voicedToUnvoiced";
};

export type TransformRomajiCondition = {
  category: "transform";
  transformType: "romaji";
  longVowel: boolean;
};

export type SearchCondition =
  | FilterRegexCondition
  | FilterDictionaryMatchCondition
  | FilterReplaceCountCondition
  | FilterLengthCondition
  | FilterCandidateCharsCondition
  | TransformRegexReplaceCondition
  | TransformSortCondition
  | TransformSmallToLargeCondition
  | TransformVoicedToUnvoicedCondition
  | TransformRomajiCondition;

export type SearchRequestPayload = {
  file: string;
  conditions: SearchCondition[];
};

export type SearchResultRow = {
  original: string;
  stages: string[];
  replaceCount: number;
};

export type SearchResponse = {
  matched: number;
  transformColumns: string[];
  results: SearchResultRow[];
};
