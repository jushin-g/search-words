import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const DICT_EXT = ".dic";

type DictionaryCacheEntry = {
  signature: string;
  set: Set<string>;
};

const dictionaryCache = new Map<string, DictionaryCacheEntry>();

export const getProjectRoot = (): string => {
  return process.cwd();
};

export const getDictionariesDir = (): string => {
  return path.join(getProjectRoot(), "public");
};

export const listDictionaryFiles = (): string[] => {
  return fs
    .readdirSync(getDictionariesDir(), { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(DICT_EXT),
    )
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "ja"));
};

export const resolveDictionaryPath = (fileName: string): string => {
  const dictionaries = new Set(listDictionaryFiles());
  if (!dictionaries.has(fileName)) {
    throw new Error(`Unknown dictionary file: ${fileName}`);
  }
  return path.join(getDictionariesDir(), fileName);
};

const loadDictionarySet = async (filePath: string): Promise<Set<string>> => {
  const set = new Set<string>();
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  try {
    for await (const raw of rl) {
      const word = raw.trim();
      if (word) {
        set.add(word);
      }
    }
  } finally {
    rl.close();
  }

  return set;
};

const getDictionarySignature = (filePath: string): string => {
  const stat = fs.statSync(filePath);
  return `${stat.mtimeMs}:${stat.size}`;
};

export const getDictionarySet = async (
  filePath: string,
): Promise<Set<string>> => {
  const signature = getDictionarySignature(filePath);
  const cached = dictionaryCache.get(filePath);

  if (cached && cached.signature === signature) {
    return cached.set;
  }

  const set = await loadDictionarySet(filePath);
  dictionaryCache.set(filePath, { signature, set });
  return set;
};
