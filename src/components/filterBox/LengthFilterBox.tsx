import { FilterLengthCondition } from "@/lib/types";
import styles from "../SearchApp.module.css";

type LengthFilterBoxProps = {
  condition: FilterLengthCondition;
  onChangeMinLength: (value?: number) => void;
  onChangeMaxLength: (value?: number) => void;
};

export const LengthFilterBox = ({
  condition,
  onChangeMinLength,
  onChangeMaxLength,
}: LengthFilterBoxProps) => {
  return (
    <div className={styles.fieldGrid}>
      <label className={styles.fieldLabel}>
        最小文字数
        <input
          type="number"
          min={0}
          value={condition.minLength ?? ""}
          onChange={(e) =>
            onChangeMinLength(
              e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
            )
          }
          placeholder="指定なし"
        />
      </label>
      <label className={styles.fieldLabel}>
        最大文字数
        <input
          type="number"
          min={0}
          value={condition.maxLength ?? ""}
          onChange={(e) =>
            onChangeMaxLength(
              e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
            )
          }
          placeholder="指定なし"
        />
      </label>
    </div>
  );
};
