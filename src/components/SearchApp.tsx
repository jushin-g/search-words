"use client";

import { useRef, useState } from "react";
import { ResultTable } from "@/components/ResultTable";
import type { SearchCondition, SearchResponse } from "@/lib/types";
import styles from "./SearchApp.module.css";
import { assertNever } from "@/lib/utils";
import { RegexReplaceTransformBox } from "./transformBox/RegexReplaceTransformBox";
import { SortTransformBox } from "./transformBox/SortTransformBox";
import { RomajiTransformBox } from "./transformBox/RomajiTransformBox";
import { RegexFilterBox } from "./filterBox/RegexFilterBox";
import { DictionaryMatchFilterBox } from "./filterBox/DictionaryMatchFilterBox";
import { ReplaceCountFilterBox } from "./filterBox/ReplaceCountFilterBox";
import { LengthFilterBox } from "./filterBox/LengthFilterBox";
import { CandidateCharsFilterBox } from "./filterBox/CandidateCharsFilterBox";
import { ConditionCard } from "./ConditionCard";
import { useDictionaries } from "@/hooks/useDictionaries";
import { DICTIONARY_NAME_MAP } from "@/constants.ts/dictionaries";

type UiSearchCondition = SearchCondition & { id: number };

const toUniqueChars = (value: string): string => {
  return Array.from(new Set(value)).join("");
};

export const SearchApp = () => {
  const [conditions, setConditions] = useState<UiSearchCondition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nextConditionId = useRef(1);
  const [result, setResult] = useState<SearchResponse>({
    matched: 0,
    transformColumns: [],
    results: [],
  });
  const { dictionaries, currentDictionary, setCurrentDictionary } =
    useDictionaries();

  const createConditionId = () => {
    const id = nextConditionId.current;
    nextConditionId.current++;
    return id;
  };

  const addCondition = (condition: SearchCondition) => {
    const id = createConditionId();
    setConditions((current) => [...current, { id, ...condition }]);
  };

  const toApiCondition = (condition: SearchCondition): SearchCondition => {
    if (condition.category === "transform") {
      const { transformType } = condition;
      switch (transformType) {
        case "regexReplace":
          return {
            category: "transform",
            transformType: "regexReplace",
            from: condition.from,
            to: condition.to,
            matchOnly: condition.matchOnly,
          };
        case "sort":
          return {
            category: "transform",
            transformType: "sort",
          };
        case "smallToLarge":
          return {
            category: "transform",
            transformType: "smallToLarge",
          };
        case "voicedToUnvoiced":
          return {
            category: "transform",
            transformType: "voicedToUnvoiced",
          };
        case "romaji":
          return {
            category: "transform",
            transformType: "romaji",
            longVowel: condition.longVowel,
          };
        default:
          return assertNever(transformType);
      }
    }

    switch (condition.filterType) {
      case "regex":
        return {
          category: "filter",
          filterType: "regex",
          pattern: condition.pattern,
        };
      case "dictionaryMatch":
        return {
          category: "filter",
          filterType: "dictionaryMatch",
          anagramMatch: condition.anagramMatch,
          file: condition.file,
        };
      case "replaceCount":
        return {
          category: "filter",
          filterType: "replaceCount",
          minCount: condition.minCount,
        };
      case "length":
        return {
          category: "filter",
          filterType: "length",
          minLength: condition.minLength,
          maxLength: condition.maxLength,
        };
      case "candidateChars":
        return {
          category: "filter",
          filterType: "candidateChars",
          candidateChars: condition.candidateChars,
          minMatchCount: condition.minMatchCount,
        };
      default:
        return assertNever(condition);
    }
  };

  const getConditionTypeLabel = (condition: SearchCondition): string => {
    if (condition.category === "transform") {
      const { transformType } = condition;
      switch (transformType) {
        case "regexReplace":
          return "正規表現置換";
        case "sort":
          return "ソート";
        case "smallToLarge":
          return "小→大";
        case "voicedToUnvoiced":
          return "濁→清";
        case "romaji":
          return "ローマ字";
        default:
          return assertNever(transformType);
      }
    }

    const { filterType } = condition;

    switch (filterType) {
      case "regex":
        return "正規表現入力";
      case "dictionaryMatch":
        return "辞書マッチ";
      case "replaceCount":
        return "変換回数";
      case "length":
        return "文字列長";
      case "candidateChars":
        return "候補文字";
      default:
        return assertNever(filterType);
    }
  };

  const defaultConditionButtons: SearchCondition[] = [
    {
      category: "filter",
      filterType: "regex",
      pattern: "^.*$",
    },
    {
      category: "filter",
      filterType: "dictionaryMatch",
      anagramMatch: false,
      file: currentDictionary,
    },
    {
      category: "filter",
      filterType: "replaceCount",
      minCount: 1,
    },
    {
      category: "filter",
      filterType: "length",
      minLength: undefined,
      maxLength: undefined,
    },
    {
      category: "filter",
      filterType: "candidateChars",
      candidateChars: "",
      minMatchCount: 0,
    },
    {
      category: "transform",
      transformType: "regexReplace",
      from: "^(.)$",
      to: "$1",
      matchOnly: false,
    },
    {
      category: "transform",
      transformType: "sort",
    },
    {
      category: "transform",
      transformType: "smallToLarge",
    },
    {
      category: "transform",
      transformType: "voicedToUnvoiced",
    },
    {
      category: "transform",
      transformType: "romaji",
      longVowel: false,
    },
  ];

  const removeCondition = (id: number) => {
    setConditions((current) =>
      current.filter((condition) => condition.id !== id),
    );
  };

  const moveCondition = (index: number, direction: -1 | 1) => {
    setConditions((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(nextIndex, 0, item);
      return next;
    });
  };

  const updateCondition = (
    id: number,
    updater: (value: UiSearchCondition) => UiSearchCondition,
  ) => {
    setConditions((current) =>
      current.map((condition) =>
        condition.id === id ? updater(condition) : condition,
      ),
    );
  };

  const renderConditionBody = (condition: UiSearchCondition) => {
    if (condition.category === "transform") {
      const { transformType } = condition;
      switch (transformType) {
        case "regexReplace":
          return (
            <RegexReplaceTransformBox
              condition={condition}
              onChangeFrom={(value) =>
                updateCondition(condition.id, (current) =>
                  current.category === "transform" &&
                  current.transformType === "regexReplace"
                    ? { ...current, from: value }
                    : current,
                )
              }
              onChangeTo={(value) =>
                updateCondition(condition.id, (current) =>
                  current.category === "transform" &&
                  current.transformType === "regexReplace"
                    ? { ...current, to: value }
                    : current,
                )
              }
              onChangeMatchOnly={(value) =>
                updateCondition(condition.id, (current) =>
                  current.category === "transform" &&
                  current.transformType === "regexReplace"
                    ? { ...current, matchOnly: value }
                    : current,
                )
              }
            />
          );
        case "sort":
          return <SortTransformBox />;
        case "smallToLarge":
          return null;
        case "voicedToUnvoiced":
          return null;
        case "romaji":
          return (
            <RomajiTransformBox
              condition={condition}
              onChangeLongVowel={(value) =>
                updateCondition(condition.id, (current) =>
                  current.category === "transform" &&
                  current.transformType === "romaji"
                    ? { ...current, longVowel: value }
                    : current,
                )
              }
            />
          );
        default:
          return assertNever(transformType);
      }
    }

    switch (condition.filterType) {
      case "regex":
        return (
          <RegexFilterBox
            condition={condition}
            onChangePattern={(value) =>
              updateCondition(condition.id, (current) =>
                current.category === "filter" && current.filterType === "regex"
                  ? { ...current, pattern: value }
                  : current,
              )
            }
          />
        );
      case "dictionaryMatch":
        return (
          <DictionaryMatchFilterBox
            condition={condition}
            dictionaries={dictionaries}
            selectedFile={condition.file}
            onChangeFile={(value) =>
              updateCondition(condition.id, (current) =>
                current.category === "filter" &&
                current.filterType === "dictionaryMatch"
                  ? { ...current, file: value }
                  : current,
              )
            }
            onChangeAnagramMatch={(value) =>
              updateCondition(condition.id, (current) =>
                current.category === "filter" &&
                current.filterType === "dictionaryMatch"
                  ? { ...current, anagramMatch: value }
                  : current,
              )
            }
          />
        );
      case "replaceCount":
        return (
          <ReplaceCountFilterBox
            condition={condition}
            onChangeMinCount={(value) =>
              updateCondition(condition.id, (current) =>
                current.category === "filter" &&
                current.filterType === "replaceCount"
                  ? { ...current, minCount: value }
                  : current,
              )
            }
          />
        );
      case "length":
        return (
          <LengthFilterBox
            condition={condition}
            onChangeMinLength={(value) =>
              updateCondition(condition.id, (current) =>
                current.category === "filter" && current.filterType === "length"
                  ? { ...current, minLength: value }
                  : current,
              )
            }
            onChangeMaxLength={(value) =>
              updateCondition(condition.id, (current) =>
                current.category === "filter" && current.filterType === "length"
                  ? { ...current, maxLength: value }
                  : current,
              )
            }
          />
        );
      case "candidateChars":
        return (
          <CandidateCharsFilterBox
            condition={condition}
            onChangeCandidateChars={(value) => {
              const uniqueChars = toUniqueChars(value);

              return updateCondition(condition.id, (current) =>
                current.category === "filter" &&
                current.filterType === "candidateChars"
                  ? {
                      ...current,
                      candidateChars: uniqueChars,
                      minMatchCount: uniqueChars.length,
                    }
                  : current,
              );
            }}
            onChangeMinMatchCount={(value) =>
              updateCondition(condition.id, (current) =>
                current.category === "filter" &&
                current.filterType === "candidateChars"
                  ? { ...current, minMatchCount: value }
                  : current,
              )
            }
          />
        );
      default:
        return null;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: currentDictionary,
          conditions: conditions.map(toApiCondition),
        }),
      });
      const data = (await res.json()) as SearchResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "検索に失敗しました。");
      }
      setResult({
        matched: data.matched,
        transformColumns: data.transformColumns,
        results: data.results,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "検索に失敗しました。");
      setResult({ matched: 0, transformColumns: [], results: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.stack}>
      <form className={styles.panel} onSubmit={onSubmit}>
        <h2>検索条件</h2>
        <div className={styles.fieldGrid}>
          <label className={styles.fieldLabel}>
            辞書
            <select
              value={currentDictionary}
              onChange={(e) => setCurrentDictionary(e.target.value)}
            >
              {dictionaries.map((dictionary) => (
                <option key={dictionary} value={dictionary}>
                  {DICTIONARY_NAME_MAP[dictionary]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className={styles.section}>
          <h2 className={styles.title}>条件</h2>
          <p className={styles.muted}>
            条件は上から順に適用されます。変換を追加すると結果列が増えます。
          </p>
          <div className={styles.conditionList}>
            {conditions.map((condition, index) => (
              <ConditionCard
                key={condition.id}
                index={index}
                total={conditions.length}
                category={condition.category}
                onMoveUp={() => moveCondition(index, -1)}
                onMoveDown={() => moveCondition(index, 1)}
                onRemove={() => removeCondition(condition.id)}
                control={`${condition.category === "filter" ? "フィルタ" : "変換"} > ${getConditionTypeLabel(condition)}`}
              >
                {renderConditionBody(condition)}
              </ConditionCard>
            ))}
          </div>

          <div className={styles.addSection}>
            <p className={styles.muted}>フィルタを追加</p>
            <div className={styles.addButtonGrid}>
              {defaultConditionButtons
                .filter((button) => button.category === "filter")
                .map((button) => (
                  <button
                    key={button.filterType}
                    type="button"
                    className={`${styles.button} ${styles.filterButton}`}
                    onClick={() => addCondition(button)}
                  >
                    + {getConditionTypeLabel(button)}
                  </button>
                ))}
            </div>
          </div>

          <div className={styles.addSection}>
            <p className={styles.muted}>変換を追加</p>
            <div className={styles.addButtonGrid}>
              {defaultConditionButtons
                .filter((button) => button.category === "transform")
                .map((button) => (
                  <button
                    key={button.transformType}
                    type="button"
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={() => addCondition(button)}
                  >
                    + {getConditionTypeLabel(button)}
                  </button>
                ))}
            </div>
          </div>
        </section>

        <button
          type="submit"
          className={`${styles.button} ${styles.submitButton}`}
          disabled={loading}
        >
          {loading ? "検索中..." : "検索"}
        </button>
      </form>

      {error ? <p className={styles.errorText}>{error}</p> : null}
      <ResultTable
        rows={result.results}
        matched={result.matched}
        transformColumns={result.transformColumns}
      />
    </div>
  );
};
