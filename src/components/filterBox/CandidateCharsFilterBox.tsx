import { FilterCandidateCharsCondition } from "@/lib/types";
import styles from "../SearchApp.module.css";

type CandidateCharsFilterBoxProps = {
  condition: FilterCandidateCharsCondition;
  onChangeCandidateChars: (value: string) => void;
  onChangeMinMatchCount: (value: number) => void;
};

export const CandidateCharsFilterBox = ({
  condition,
  onChangeCandidateChars,
  onChangeMinMatchCount,
}: CandidateCharsFilterBoxProps) => {
  return (
    <div className={styles.fieldGrid}>
      <label className={styles.fieldLabel}>
        候補文字
        <input
          className={styles.regexInput}
          value={condition.candidateChars}
          onChange={(e) => onChangeCandidateChars(e.target.value)}
        />
      </label>
      <label className={styles.fieldLabel}>
        最低一致数
        <input
          type="number"
          min={0}
          value={condition.minMatchCount}
          onChange={(e) =>
            onChangeMinMatchCount(Math.max(0, Number(e.target.value || 0)))
          }
        />
      </label>
    </div>
  );
};
