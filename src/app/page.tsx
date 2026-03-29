import { SearchApp } from "@/components/SearchApp";
import styles from "./page.module.css";

const Page = () => {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1>辞書フィルター</h1>
        <p>正規表現と置換ルールを重ねて辞書を検索します。</p>
      </header>
      <SearchApp />
    </main>
  );
};

export default Page;
