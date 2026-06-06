function parseMarkdown(url, md) {
  const headings = [];
  for (const line of md.split("\n")) {
    const m = line.match(/^(#{1,3})\s+(.+)/);
    if (m) headings.push({ level: m[1].length, text: m[2].trim() });
  }
  return {
    url,
    h1: headings.find((h) => h.level === 1)?.text || "",
    h2: headings.filter((h) => h.level === 2).map((h) => h.text),
    h3: headings.filter((h) => h.level === 3).map((h) => h.text),
    wordCount: md.split(/\s+/).filter(Boolean).length,
  };
}

async function crawlOne(url) {
  try {
    const headers = { "X-Return-Format": "markdown" };
    if (process.env.JINA_API_KEY)
      headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;

    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers,
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return parseMarkdown(url, await res.text());
  } catch {
    return null;
  }
}

export async function crawlPages(urls, concurrency = 2) {
  const results = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map(crawlOne))));
  }
  return results.filter(Boolean);
}