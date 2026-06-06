"use client";
import { useState } from "react";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

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
          <p className="text-sm text-gray-500">
            Pages analyzed: {data.analyzedPages} · target length ~{b.targetWordCount} words
          </p>
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