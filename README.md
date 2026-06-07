# SEO Content Brief Generator

Turn any keyword (or a list of them) into a ready-to-write, structured SEO content brief in ~30 seconds. The app researches the live Google top results, reads the competing pages, and uses Claude to produce a brief with title, outline, target length, subtopics, keywords, FAQ, content gaps, and the analyzed sources.

**Live demo:** https://seo-brief-tau.vercel.app

## Features

- Single keyword or **bulk** (a list of keywords)
- **Region / language** selector (Google country + language)
- Live progress while generating
- Brief includes: recommended title, meta description, target word count, H2/H3 outline, subtopics, LSI keywords, FAQ (from People Also Ask), **content gaps**, and the **sources analyzed** (links + word counts)
- **Inline editing** of any brief before export
- Export to **Copy / Word / PDF**
- **History** of past briefs (stored locally in the browser)

## How it works

1. **Collect** — the keyword is sent to the SERP API, which returns the top results, People Also Ask, and related searches.
2. **Crawl** — the top pages are fetched and their heading structure (H1/H2/H3) and word count are extracted.
3. **Generate** — the collected data is sent to Claude, which returns the structured brief as JSON.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend / Backend | Next.js (App Router) |
| SERP data | [Serper.dev](https://serper.dev) |
| Crawling | [Jina AI Reader](https://jina.ai/reader) |
| AI | Claude (Anthropic API), model `claude-sonnet-4-6` |
| Hosting | Vercel |

## Getting started (local)

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)

### Setup

```bash
git clone https://github.com/Marin-uu/seo-brief.git
cd seo-brief
npm install
```

Create a file named `.env.local` in the project root with your API keys:

```bash
SERPER_API_KEY=your_serper_key
ANTHROPIC_API_KEY=your_anthropic_key
JINA_API_KEY=your_jina_key
```

Then run the dev server:

```bash
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Where to get it |
| --- | --- | --- |
| `SERPER_API_KEY` | Yes | [serper.dev](https://serper.dev) (free starter credits) |
| `ANTHROPIC_API_KEY` | Yes | [console.anthropic.com](https://console.anthropic.com) (pay-as-you-go; separate from a Claude subscription) |
| `JINA_API_KEY` | Optional | [jina.ai/reader](https://jina.ai/reader) (raises rate limits; the reader also works without a key) |

`.env.local` is gitignored — never commit your keys.

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import it in Vercel.
3. Add the same three environment variables in **Project Settings → Environment Variables**.
4. Deploy.

The API route sets `maxDuration = 60` to fit Vercel's Hobby limit. To stay within it, the crawler reads the top 4 results with a per-page timeout.

## Project structure

```
src/
  app/
    page.js              UI (form, modes, results, export, history, editing)
    api/brief/route.js   Orchestration: SERP -> crawl -> Claude
  lib/
    serper.js            Fetches Google top results + PAA + related searches
    crawl.js             Reads competitor pages via Jina, parses headings
    brief.js             Builds the prompt and calls Claude
```

## Notes & limits

- **Cost:** roughly 1–2 cents per brief (Serper + Claude). Bulk runs multiply this per keyword.
- **Time:** ~30 seconds per keyword; bulk runs process keywords sequentially.
- **History** is stored per browser (localStorage), not shared across devices or users.

## Roadmap

- Access control (password) for sharing the link safely
- Reddit / forum mining (Apify) to enrich subtopics and FAQ
- Shared team history (database) instead of per-browser storage
- Keyword metrics (search volume and difficulty)

---

Built with help from Claude (Anthropic).