"use client";

import type { SearchResultRow } from "@/lib/types";
import styles from "./ResultTable.module.css";

type Props = {
  rows: SearchResultRow[];
  matched: number;
  transformColumns: string[];
};

export const ResultTable = ({ rows, matched, transformColumns }: Props) => {
  const hasTransform = transformColumns.length > 0;

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>結果</h2>
      <p className={styles.muted}>一致件数: {matched}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>元の語</th>
              {transformColumns.map((column, index) => (
                <th key={`transform-header-${index}`}>
                  #{index + 1}: {column}
                </th>
              ))}
              {!hasTransform ? <th>最終語</th> : null}
              <th>変換回数</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.original}-${index}`}>
                <td>{row.original}</td>
                {transformColumns.map((_, stageIndex) => (
                  <td key={`${row.original}-${index}-${stageIndex}`}>
                    {row.stages[stageIndex] ?? row.original}
                  </td>
                ))}
                {!hasTransform ? <td>{row.original}</td> : null}
                <td>{row.replaceCount}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={transformColumns.length + 3}
                  className={styles.emptyCell}
                >
                  結果はありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};
