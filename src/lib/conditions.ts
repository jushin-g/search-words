import type { SearchCondition } from "@/lib/types";
import { assertNever } from "./utils";

export type ParsedFilterCondition =
  | {
      category: "filter";
      filterType: "regex";
      regex: RegExp;
    }
  | {
      category: "filter";
      filterType: "dictionaryMatch";
      anagramMatch: boolean;
      file: string;
    }
  | {
      category: "filter";
      filterType: "replaceCount";
      minCount: number;
    }
  | {
      category: "filter";
      filterType: "length";
      minLength?: number;
      maxLength?: number;
    }
  | {
      category: "filter";
      filterType: "candidateChars";
      candidateChars: string;
      minMatchCount: number;
    };

export type ParsedTransformCondition =
  | {
      category: "transform";
      transformType: "regexReplace";
      from: string;
      to: string;
      matchOnly: boolean;
      regex: RegExp;
    }
  | {
      category: "transform";
      transformType: "sort";
    }
  | {
      category: "transform";
      transformType: "smallToLarge";
    }
  | {
      category: "transform";
      transformType: "voicedToUnvoiced";
    }
  | {
      category: "transform";
      transformType: "romaji";
      longVowel: boolean;
    };

export type ParsedSearchCondition =
  | ParsedFilterCondition
  | ParsedTransformCondition;

export const parseConditions = (
  conditions: SearchCondition[],
): ParsedSearchCondition[] => {
  return conditions.map((condition, index) => {
    if (condition.category === "transform") {
      const { transformType } = condition;
      switch (transformType) {
        case "regexReplace": {
          const from = String(condition.from || "").trim();
          if (!from) {
            throw new Error(
              `Condition ${index + 1}: transform regex is empty.`,
            );
          }
          try {
            return {
              category: "transform",
              transformType: "regexReplace",
              from,
              to: String(condition.to || ""),
              matchOnly: Boolean(condition.matchOnly),
              regex: new RegExp(from, "g"),
            };
          } catch {
            throw new Error(`Condition ${index + 1}: invalid transform regex.`);
          }
        }
        case "sort": {
          return {
            category: "transform",
            transformType: "sort",
          };
        }
        case "smallToLarge": {
          return { category: "transform", transformType: "smallToLarge" };
        }
        case "voicedToUnvoiced": {
          return { category: "transform", transformType: "voicedToUnvoiced" };
        }
        case "romaji": {
          return {
            category: "transform",
            transformType: "romaji",
            longVowel: Boolean(condition.longVowel),
          };
        }
        default: {
          return assertNever(transformType);
        }
      }
    }

    const { filterType } = condition;

    switch (filterType) {
      case "regex": {
        const pattern = String(condition.pattern || "").trim();
        if (!pattern) {
          throw new Error(`Condition ${index + 1}: regex pattern is empty.`);
        }
        try {
          return {
            category: "filter",
            filterType: "regex",
            regex: new RegExp(pattern),
          };
        } catch {
          throw new Error(`Condition ${index + 1}: invalid regex pattern.`);
        }
      }
      case "dictionaryMatch": {
        const file = String(condition.file || "").trim();
        if (!file) {
          throw new Error(`Condition ${index + 1}: dictionary file is empty.`);
        }

        return {
          category: "filter",
          filterType: "dictionaryMatch",
          anagramMatch: Boolean(condition.anagramMatch),
          file,
        };
      }
      case "replaceCount": {
        return {
          category: "filter",
          filterType: "replaceCount",
          minCount: Math.max(0, Number(condition.minCount) || 0),
        };
      }
      case "length": {
        const minLength = condition.minLength
          ? Math.max(0, Number(condition.minLength))
          : undefined;
        const maxLength = condition.maxLength
          ? Math.max(0, Number(condition.maxLength))
          : undefined;

        if (
          minLength !== undefined &&
          maxLength !== undefined &&
          minLength > maxLength
        ) {
          throw new Error(
            `Condition ${index + 1}: minLength cannot be greater than maxLength.`,
          );
        }

        return {
          category: "filter",
          filterType: "length",
          minLength,
          maxLength,
        };
      }
      case "candidateChars": {
        const candidateChars = String(condition.candidateChars || "").trim();
        if (!candidateChars) {
          throw new Error(`Condition ${index + 1}: candidate chars is empty.`);
        }

        const minMatchCount = Math.max(0, Number(condition.minMatchCount) || 0);
        if (minMatchCount > candidateChars.length) {
          throw new Error(
            `Condition ${index + 1}: minMatchCount cannot be greater than candidate chars length.`,
          );
        }

        return {
          category: "filter",
          filterType: "candidateChars",
          candidateChars,
          minMatchCount,
        };
      }
      default:
        return assertNever(filterType);
    }
  });
};
