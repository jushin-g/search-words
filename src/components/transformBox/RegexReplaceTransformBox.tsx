import { TransformRegexReplaceCondition } from "@/lib/types";
import styles from "../SearchApp.module.css";

type RegexReplaceTransformBoxProps = {
  condition: TransformRegexReplaceCondition;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onChangeMatchOnly: (value: boolean) => void;
};

export const RegexReplaceTransformBox = ({
  condition,
  onChangeFrom,
  onChangeTo,
  onChangeMatchOnly,
}: RegexReplaceTransformBoxProps) => {
  return (
    <div className={styles.transformGrid}>
      <label className={styles.fieldLabel}>
        from（正規表現）
        <input
          className={styles.regexInput}
          value={condition.from}
          onChange={(e) => onChangeFrom(e.target.value)}
        />
      </label>
      <label className={styles.fieldLabel}>
        to
        <input
          className={styles.regexInput}
          value={condition.to}
          onChange={(e) => onChangeTo(e.target.value)}
        />
      </label>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={condition.matchOnly}
          onChange={(e) => onChangeMatchOnly(e.target.checked)}
        />
        マッチのみ抽出
      </label>
    </div>
  );
};
