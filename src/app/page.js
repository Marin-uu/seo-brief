"use client";
import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, crawl: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const b = data?.brief;

  function briefToText() {
    const lines = [];
    lines.push(`SEO Content Brief: ${data.keyword}`);
    lines.push(`Target length: ~${b.targetWordCount} words`);
    lines.push("");
    lines.push(`TITLE: ${b.recommendedTitle}`);
    lines.push(`META DESCRIPTION: ${b.metaDescription}`);
    lines.push("");
    lines.push("OUTLINE:");
    b.outline.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.h2}`);
      (s.h3 || []).forEach((h) => lines.push(`   - ${h}`));
    });
    lines.push("");
    lines.push("SUBTOPICS TO COVER:");
    b.subtopicsToCover.forEach((x) => lines.push(`- ${x}`));
    lines.push("");
    lines.push(`LSI KEYWORDS: ${b.lsiKeywords.join(", ")}`);
    lines.push("");
    lines.push("FAQ:");
    b.faq.forEach((q) => lines.push(`- ${q}`));
    return lines.join("\n");
  }

  async function copyBrief() {
    await navigator.clipboard.writeText(briefToText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadWord() {
    const h3html = (arr) =>
      arr?.length ? `<ul>${arr.map((h) => `<li>${h}</li>`).join("")}</ul>` : "";
    const html = `<html><head><meta charset="utf-8"></head><body>
<h1>SEO Content Brief: ${data.keyword}</h1>
<p><b>Target length:</b> ~${b.targetWordCount} words</p>
<h2>Title</h2><p>${b.recommendedTitle}</p>
<h2>Meta description</h2><p>${b.metaDescription}</p>
<h2>Outline</h2>
<ol>${b.outline.map((s) => `<li><b>${s.h2}</b>${h3html(s.h3)}</li>`).join("")}</ol>
<h2>Subtopics to cover</h2>
<ul>${b.subtopicsToCover.map((x) => `<li>${x}</li>`).join("")}</ul>
<h2>LSI keywords</h2><p>${b.lsiKeywords.join(", ")}</p>
<h2>FAQ</h2>
<ul>${b.faq.map((q) => `<li>${q}</li>`).join("")}</ul>
</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-brief-${data.keyword}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">SEO Content Brief Generator</h1>
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Enter a keyword…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
        />
        <button
          onClick={generate}
          disabled={loading || !keyword}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Generate"}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {b && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500 flex-1">
              Pages analyzed: {data.analyzedPages} · target length ~{b.targetWordCount} words
            </p>
            <button onClick={copyBrief} className="border rounded px-3 py-1 text-sm">
              {copied ? "Copied!" : "Copy"}
            </button>
            <button onClick={downloadWord} className="border rounded px-3 py-1 text-sm">
              Download Word
            </button>
          </div>
          <Section title="Title">{b.recommendedTitle}</Section>
          <Section title="Meta description">{b.metaDescription}</Section>
          <Section title="Outline">
            <ol className="list-decimal ml-5 space-y-1">
              {b.outline.map((s, i) => (
                <li key={i}>
                  <b>{s.h2}</b>
                  {s.h3?.length > 0 && (
                    <ul className="list-disc ml-5 text-gray-600">
                      {s.h3.map((h, j) => <li key={j}>{h}</li>)}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Subtopics to cover">{b.subtopicsToCover.join(", ")}</Section>
          <Section title="LSI keywords">{b.lsiKeywords.join(", ")}</Section>
          <Section title="FAQ">
            <ul className="list-disc ml-5">{b.faq.map((q, i) => <li key={i}>{q}</li>)}</ul>
          </Section>
        </div>
      )}
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-1">{title}</h2>
      <div>{children}</div>
    </div>
  );
}