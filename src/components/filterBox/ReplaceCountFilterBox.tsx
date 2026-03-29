import { FilterReplaceCountCondition } from "@/lib/types";
import styles from "../SearchApp.module.css";

type ReplaceCountFilterBoxProps = {
  condition: FilterReplaceCountCondition;
  onChangeMinCount: (value: number) => void;
};

export const ReplaceCountFilterBox = ({
  condition,
  onChangeMinCount,
}: ReplaceCountFilterBoxProps) => {
  return (
    <label className={styles.fieldLabel}>
      最小変換回数
      <input
        type="number"
        min={0}
        value={condition.minCount}
        onChange={(e) =>
          onChangeMinCount(Math.max(0, Number(e.target.value || 0)))
        }
      />
    </label>
  );
};
