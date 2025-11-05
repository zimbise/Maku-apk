import React, { useEffect, useState } from "react";
import "./App.css";

const DEFAULT_QUERY = "one piece"; // Change this to anything you want

function App() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const runSearch = async (query: string) => {
    setLoading(true);
    const providers = [
      "https://1337x.to/search/",
      "https://nyaa.si/?f=0&c=0_0&q=",
      "https://zooqle.com/search?q=",
      "https://solidtorrents.to/search?q=",
      "https://btdig.com/search?q=",
      "https://torrentproject2.com/?t="
    ];

    const allResults: string[] = [];

    for (const base of providers) {
      try {
        const res = await fetch(`http://localhost:10000/${encodeURIComponent(base + query)}`);
        const html = await res.text();
        const magnets = extractMagnetLinks(html);
        allResults.push(...magnets);
      } catch (err) {
        console.warn("Provider failed:", base, err);
      }
    }

    setResults([...new Set(allResults)]);
    setLoading(false);
  };

  useEffect(() => {
    runSearch(DEFAULT_QUERY);
  }, []);

  return (
    <div className="App">
      <h1>🧲 Torrent Aggregator</h1>
      {loading && <p>🔍 Searching for "{DEFAULT_QUERY}"…</p>}
      {!loading && results.length === 0 && <p>No results found.</p>}
      <ul>
        {results.map((magnet, i) => (
          <li key={i}>
            <a href={magnet} target="_blank" rel="noopener noreferrer">
              🎯 Download with Torrent Client
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function extractMagnetLinks(html: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const domLinks = Array.from(doc.querySelectorAll("a[href^='magnet:']"))
    .map(link => link.getAttribute("href") || "");

  const regexLinks = Array.from(html.matchAll(/magnet:\?xt=urn:[^"'&<>\s]+/g)).map(m => m[0]);

  return [...new Set([...domLinks, ...regexLinks])];
}

export default App;
