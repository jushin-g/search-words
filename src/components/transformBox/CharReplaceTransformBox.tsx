import { TransformCharReplaceCondition } from "@/lib/types";
import styles from "../SearchApp.module.css";

type CharReplaceTransformBoxProps = {
  condition: TransformCharReplaceCondition;
  onChangeReplaceType: (value: "smallToLarge" | "voicedToUnvoiced") => void;
};

export const CharReplaceTransformBox = ({
  condition,
  onChangeReplaceType,
}: CharReplaceTransformBoxProps) => {
  return (
    <div className={styles.transformGrid}>
      <label className={styles.fieldLabel}>
        変換種別
        <select
          value={condition.replaceType}
          onChange={(e) =>
            onChangeReplaceType(
              e.target.value as "smallToLarge" | "voicedToUnvoiced",
            )
          }
        >
          <option value="smallToLarge">小→大（ゃ→や など）</option>
          <option value="voicedToUnvoiced">濁→清（が→か、ぱ→は など）</option>
        </select>
      </label>
    </div>
  );
};
