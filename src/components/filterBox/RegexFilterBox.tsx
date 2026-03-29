import { FilterRegexCondition } from "@/lib/types";
import styles from "../SearchApp.module.css";

type RegexFilterBoxProps = {
  condition: FilterRegexCondition;
  onChangePattern: (value: string) => void;
};

export const RegexFilterBox = ({
  condition,
  onChangePattern,
}: RegexFilterBoxProps) => {
  return (
    <label className={styles.fieldLabel}>
      正規表現
      <input
        className={styles.regexInput}
        value={condition.pattern}
        onChange={(e) => onChangePattern(e.target.value)}
      />
    </label>
  );
};
