import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function generateBrief({ keyword, serp, pages }) {
  const avgWords = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.wordCount, 0) / pages.length)
    : null;

  const competitors = pages
    .map(
      (p, i) =>
        `Competitor ${i + 1} (${p.wordCount} words): ${p.h1}\n  H2: ${p.h2.join(" | ")}`
    )
    .join("\n");

  const prompt = `You are an experienced SEO strategist. Based on an analysis of the Google top results for the query "${keyword}", create a content brief.

COMPETITOR TITLES (top 10):
${serp.organic.map((r) => `- ${r.title}`).join("\n")}

People Also Ask:
${serp.peopleAlsoAsk.map((q) => `- ${q}`).join("\n") || "none"}

Related Searches:
${serp.relatedSearches.join(", ") || "none"}

COMPETITOR STRUCTURE:
${competitors || "not crawled"}
${avgWords ? `\nAverage article length: ~${avgWords} words.` : ""}

Write the entire brief in English. Return strictly JSON with no markdown wrappers, following this schema:
{
  "recommendedTitle": "string",
  "metaDescription": "string (up to 155 characters)",
  "targetWordCount": number,
  "outline": [{ "h2": "string", "h3": ["string"] }],
  "subtopicsToCover": ["string"],
  "lsiKeywords": ["string"],
  "faq": ["string"]
}`;

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content.find((b) => b.type === "text")?.text ?? "";
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}