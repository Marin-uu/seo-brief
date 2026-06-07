"use client";
import { useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const REGIONS = [
  { label: "United States (English)", value: "us|en" },
  { label: "United Kingdom (English)", value: "gb|en" },
  { label: "Germany (German)", value: "de|de" },
  { label: "France (French)", value: "fr|fr" },
  { label: "Spain (Spanish)", value: "es|es" },
  { label: "Italy (Italian)", value: "it|it" },
  { label: "Brazil (Portuguese)", value: "br|pt" },
  { label: "India (English)", value: "in|en" },
  { label: "Russia (Russian)", value: "ru|ru" },
];

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("us|en");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true); setError(""); setData(null);
    const steps = ["Searching Google…", "Reading competitor pages…", "Writing the brief…"];
    setStatus(steps[0]);
    const t1 = setTimeout(() => setStatus(steps[1]), 3000);
    const t2 = setTimeout(() => setStatus(steps[2]), 15000);
    const [gl, hl] = region.split("|");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, crawl: true, gl, hl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (e) { setError(e.message); }
    finally {
      clearTimeout(t1); clearTimeout(t2);
      setStatus("");
      setLoading(false);
    }
  }

  const b = data?.brief;

  function briefToHtml() {
    const h3html = (arr) =>
      arr?.length ? `<ul>${arr.map((h) => `<li>${h}</li>`).join("")}</ul>` : "";
    return `<html><head><meta charset="utf-8"><title>SEO Content Brief: ${data.keyword}</title></head><body style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
<h1>SEO Content Brief: ${data.keyword}</h1>
<p><b>Target length:</b> ~${b.targetWordCount} words</p>
<h2>Title</h2><p>${b.recommendedTitle}</p>
<h2>Meta description</h2><p>${b.metaDescription}</p>
<h2>Outline</h2>
<ol>${b.outline.map((s) => `<li><b>${s.h2}</b>${h3html(s.h3)}</li>`).join("")}</ol>
<h2>Subtopics to cover</h2>
<ul>${b.subtopicsToCover.map((x) => `<li>${x}</li>`).join("")}</ul>
<h2>LSI keywords</h2><p>${b.lsiKeywords.join(", ")}</p>
<h2>Content gaps (opportunities)</h2>
<ul>${(b.contentGaps || []).map((x) => `<li>${x}</li>`).join("")}</ul>
<h2>FAQ</h2>
<ul>${b.faq.map((q) => `<li>${q}</li>`).join("")}</ul>
</body></html>`;
  }

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
    lines.push("CONTENT GAPS (OPPORTUNITIES):");
    (b.contentGaps || []).forEach((x) => lines.push(`- ${x}`));
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
    const blob = new Blob(["\ufeff", briefToHtml()], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seo-brief-${data.keyword}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(briefToHtml());
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className={`${inter.className} min-h-screen bg-[#f9f9f9] text-[#1a1a1a]`}>
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-[#4169e1] uppercase">
            <span className="h-2 w-2 rounded-full bg-[#4169e1]"></span>
            Plus8Soft
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Content Brief Generator</h1>
          <p className="text-[#6b7280]">Turn any keyword into a ready-to-write content brief in seconds.</p>
        </header>

        <div className="bg-white border border-[#e2e4eb] rounded-xl shadow-sm p-5 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border border-[#e2e4eb] rounded-lg px-3 py-2 bg-white text-sm sm:w-56"
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <input
              className="border border-[#e2e4eb] rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-[#4169e1]"
              placeholder="Enter a keyword…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generate()}
            />
            <button
              onClick={generate}
              disabled={loading || !keyword}
              className="bg-[#4169e1] hover:bg-[#3457c4] text-white font-medium rounded-lg px-5 py-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Analyzing…" : "Generate"}
            </button>
          </div>
          {loading && status && (
            <p className="text-sm text-[#4169e1] animate-pulse">{status}</p>
          )}
          {error && <p className="text-sm text-[#c53939]">{error}</p>}
        </div>

        <div className="bg-[#eef2fd] border border-[#d6dde5] rounded-xl p-4 text-sm text-[#373737] space-y-1">
          <p className="font-semibold text-[#1a1a1a]">How to use</p>
          <p>1. Pick the target country/language, then enter your focus keyword.</p>
          <p>2. Hit Generate — it reads the live Google top 10 and analyzes competitors (~30s).</p>
          <p>3. Review the brief, then Copy / Word / PDF to hand it to a writer.</p>
        </div>

        {b && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-[#6b7280] flex-1">
                Pages analyzed: {data.analyzedPages} · target length ~{b.targetWordCount} words
              </p>
              <button onClick={copyBrief} className="border border-[#e2e4eb] rounded-lg px-3 py-1 text-sm hover:bg-[#f9f9f9]">
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={downloadWord} className="border border-[#e2e4eb] rounded-lg px-3 py-1 text-sm hover:bg-[#f9f9f9]">
                Word
              </button>
              <button onClick={downloadPdf} className="border border-[#e2e4eb] rounded-lg px-3 py-1 text-sm hover:bg-[#f9f9f9]">
                PDF
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
                      <ul className="list-disc ml-5 text-[#6b7280]">
                        {s.h3.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </Section>
            <Section title="Subtopics to cover">{b.subtopicsToCover.join(", ")}</Section>
            <Section title="LSI keywords">{b.lsiKeywords.join(", ")}</Section>
            <Section title="Content gaps — opportunities to win">
              <ul className="list-disc ml-5">{(b.contentGaps || []).map((g, i) => <li key={i}>{g}</li>)}</ul>
            </Section>
            <Section title="FAQ">
              <ul className="list-disc ml-5">{b.faq.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </Section>
            <Section title="Sources analyzed (top 10)">
              <ol className="list-decimal ml-5 space-y-1">
                {data.serp.organic.map((r, i) => {
                  const page = data.pages?.find((p) => p.url === r.link);
                  return (
                    <li key={i}>
                      <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-[#4169e1] underline">{r.title}</a>
                      {page && <span className="text-[#6b7280]"> — {page.wordCount} words</span>}
                    </li>
                  );
                })}
              </ol>
            </Section>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-[#e2e4eb] rounded-xl shadow-sm p-5">
      <h2 className="font-semibold mb-2 text-[#4169e1]">{title}</h2>
      <div>{children}</div>
    </div>
  );
}