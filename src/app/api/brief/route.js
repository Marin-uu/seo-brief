import { NextResponse } from "next/server";
import { getSerp } from "@/lib/serper";
import { crawlPages } from "@/lib/crawl";
import { generateBrief } from "@/lib/brief";

export const maxDuration = 60;

export async function POST(req) {
  try {
    const { keyword, crawl = true, gl, hl } = await req.json();
    if (!keyword?.trim())
      return NextResponse.json({ error: "keyword required" }, { status: 400 });

    const serp = await getSerp(keyword, { gl, hl });
    const pages = crawl
      ? await crawlPages(serp.organic.slice(0, 6).map((r) => r.link))
      : [];
    const brief = await generateBrief({ keyword, serp, pages });

    return NextResponse.json({ keyword, brief, serp, pages, analyzedPages: pages.length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}