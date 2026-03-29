import { NextResponse } from "next/server";
import { listDictionaryFiles } from "@/lib/dictionaries";

export const GET = async () => {
  try {
    return NextResponse.json({ dictionaries: listDictionaryFiles() });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list dictionaries.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};
