"use client";

import { useMemo, useState } from "react";
import type { SearchResultRow } from "@/lib/types";
import styles from "./ResultTable.module.css";

type Props = {
  rows: SearchResultRow[];
  matched: number;
  transformColumns: string[];
};

const ROW_HEIGHT = 34;
const OVERSCAN_ROWS = 12;

export const ResultTable = ({ rows, matched, transformColumns }: Props) => {
  const [scrollTop, setScrollTop] = useState(0);
  const hasTransform = transformColumns.length > 0;

  const visibleRange = useMemo(() => {
    const headerOffset = 0;
    const viewportHeight = 720;
    const startIndex = Math.max(
      0,
      Math.floor((scrollTop - headerOffset) / ROW_HEIGHT) - OVERSCAN_ROWS,
    );
    const endIndex = Math.min(
      rows.length,
      startIndex + Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN_ROWS * 2,
    );

    return { startIndex, endIndex };
  }, [rows.length, scrollTop]);

  const visibleRows = rows.slice(
    visibleRange.startIndex,
    visibleRange.endIndex,
  );
  const topPadding = visibleRange.startIndex * ROW_HEIGHT;
  const bottomPadding =
    Math.max(0, rows.length - visibleRange.endIndex) * ROW_HEIGHT;

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>結果</h2>
      <p className={styles.muted}>一致件数: {matched}</p>
      <div
        className={styles.tableWrap}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
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
            {topPadding > 0 ? (
              <tr>
                <td
                  style={{ height: topPadding, padding: 0, border: "none" }}
                />
              </tr>
            ) : null}
            {visibleRows.map((row, index) => (
              <tr key={`${row.original}-${visibleRange.startIndex + index}`}>
                <td>{row.original}</td>
                {transformColumns.map((_, stageIndex) => (
                  <td
                    key={`${row.original}-${visibleRange.startIndex + index}-${stageIndex}`}
                  >
                    {row.stages[stageIndex] ?? row.original}
                  </td>
                ))}
                {!hasTransform ? <td>{row.original}</td> : null}
                <td>{row.replaceCount}</td>
              </tr>
            ))}
            {visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={transformColumns.length + 3}
                  className={styles.emptyCell}
                >
                  結果はありません。
                </td>
              </tr>
            ) : null}
            {bottomPadding > 0 ? (
              <tr aria-hidden="true">
                <td
                  style={{ height: bottomPadding, padding: 0, border: "none" }}
                />
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
};
