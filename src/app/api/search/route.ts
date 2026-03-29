import { NextRequest, NextResponse } from "next/server";
import { runSearch } from "@/lib/search";
import type { SearchRequestPayload } from "@/lib/types";

export const POST = async (req: NextRequest) => {
  try {
    const payload = (await req.json()) as SearchRequestPayload;
    const result = await runSearch(payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
