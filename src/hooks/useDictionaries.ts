import { useEffect, useState } from "react";

export const useDictionaries = () => {
  const [dictionaries, setDictionaries] = useState<string[]>([]);
  const [currentDictionary, setCurrentDictionary] = useState("");

  useEffect(() => {
    const loadDictionaries = async () => {
      try {
        const res = await fetch("/api/dictionaries");
        const data = (await res.json()) as {
          dictionaries?: string[];
          error?: string;
        };
        if (!res.ok || !Array.isArray(data.dictionaries)) {
          throw new Error(data.error || "辞書一覧の取得に失敗しました。");
        }
        setDictionaries(data.dictionaries);
        if (data.dictionaries.length > 0) {
          setCurrentDictionary(data.dictionaries[0]);
        }
      } catch (e) {
        throw new Error(
          e instanceof Error ? e.message : "辞書一覧の取得に失敗しました。",
        );
      }
    };

    loadDictionaries();
  }, []);

  return { dictionaries, currentDictionary, setCurrentDictionary };
};
