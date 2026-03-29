import type { ReactNode } from "react";
import styles from "./SearchApp.module.css";
import clsx from "clsx";

type ConditionCardProps = {
  index: number;
  total: number;
  category: "filter" | "transform";
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  control: string;
  children: ReactNode;
};

export const ConditionCard = ({
  index,
  total,
  category,
  onMoveUp,
  onMoveDown,
  onRemove,
  control,
  children,
}: ConditionCardProps) => {
  return (
    <div
      className={clsx(
        styles.conditionRow,
        category === "filter" ? styles.filterRow : styles.transformRow,
      )}
    >
      <div className={styles.conditionHeader}>
        <p
          className={clsx(
            styles.typeTag,
            category === "filter" ? styles.Filter : styles.Transform,
          )}
        >
          {control}
        </p>
        <div className={styles.rowActions}>
          <button
            type="button"
            className={`${styles.button} ${styles.rowButton}`}
            onClick={onMoveUp}
            disabled={index === 0}
          >
            ↑
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.rowButton}`}
            onClick={onMoveDown}
            disabled={index === total - 1}
          >
            ↓
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.rowButton}`}
            onClick={onRemove}
          >
            削除
          </button>
        </div>
      </div>
      {children}
    </div>
  );
};
