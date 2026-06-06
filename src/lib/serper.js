export async function getSerp(keyword, { gl = "us", hl = "en" } = {}) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: keyword, gl, hl, num: 10 }),
  });
  if (!res.ok) throw new Error(`Serper ${res.status}`);
  const data = await res.json();

  return {
    organic: (data.organic || []).slice(0, 10).map((r) => ({
      position: r.position,
      title: r.title,
      link: r.link,
      snippet: r.snippet,
    })),
    peopleAlsoAsk: (data.peopleAlsoAsk || []).map((p) => p.question),
    relatedSearches: (data.relatedSearches || []).map((r) => r.query),
  };
}