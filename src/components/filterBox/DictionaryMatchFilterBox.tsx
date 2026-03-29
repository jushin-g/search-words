import type { FilterDictionaryMatchCondition } from "@/lib/types";
import styles from "../SearchApp.module.css";
import { DICTIONARY_NAME_MAP } from "@/constants.ts/dictionaries";

type DictionaryMatchFilterBoxProps = {
  condition: FilterDictionaryMatchCondition;
  dictionaries: string[];
  selectedFile: string;
  onChangeFile: (value: string) => void;
  onChangeAnagramMatch: (value: boolean) => void;
};

export const DictionaryMatchFilterBox = ({
  condition,
  dictionaries,
  selectedFile,
  onChangeFile,
  onChangeAnagramMatch,
}: DictionaryMatchFilterBoxProps) => {
  return (
    <div className={styles.stack}>
      <label className={styles.fieldLabel}>
        辞書フィルタの辞書
        <select
          value={selectedFile}
          onChange={(e) => onChangeFile(e.target.value)}
        >
          {dictionaries.map((dictionary) => (
            <option key={dictionary} value={dictionary}>
              {DICTIONARY_NAME_MAP[dictionary]}
            </option>
          ))}
        </select>
      </label>
      <p className={styles.muted}>
        この時点の文字列が、選択した辞書に存在する語だけ残します。
      </p>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={condition.anagramMatch}
          onChange={(e) => onChangeAnagramMatch(e.target.checked)}
        />
        アナグラムマッチ
      </label>
    </div>
  );
};
