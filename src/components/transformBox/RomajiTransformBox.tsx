import { TransformRomajiCondition } from "@/lib/types";
import styles from "../SearchApp.module.css";

type RomajiTransformBoxProps = {
  condition: TransformRomajiCondition;
  onChangeLongVowel: (value: boolean) => void;
};

export const RomajiTransformBox = ({
  condition,
  onChangeLongVowel,
}: RomajiTransformBoxProps) => {
  return (
    <label className={styles.checkboxLabel}>
      <input
        type="checkbox"
        checked={condition.longVowel}
        onChange={(e) => onChangeLongVowel(e.target.checked)}
      />
      長音の母音化
    </label>
  );
};
