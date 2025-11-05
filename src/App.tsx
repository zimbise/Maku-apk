import React, { useEffect, useState } from "react";
import "./App.css";
import providerList from "./config/providers.json";

const DEFAULT_QUERY = "one piece";

function App() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState(providerList.providers);
  const [customName, setCustomName] = useState("");
  const [customURL, setCustomURL] = useState("");

  const runSearch = async (query: string) => {
    setLoading(true);
    const active = providers.filter(p => p.enabled);
    const allResults: string[] = [];

    for (const p of active) {
      try {
        const res = await fetch(`http://localhost:10000/${encodeURIComponent(p.url + query)}`);
        const html = await res.text();
        const magnets = extractMagnetLinks(html);
        allResults.push(...magnets);
      } catch (err) {
        console.warn("Provider failed:", p.name, err);
      }
    }

    setResults([...new Set(allResults)]);
    setLoading(false);
  };

  useEffect(() => {
    runSearch(DEFAULT_QUERY);
  }, []);

  const toggleProvider = (name: string) => {
    const updated = providers.map(p =>
      p.name === name ? { ...p, enabled: !p.enabled } : p
    );
    setProviders(updated);
  };

  const addCustomProvider = () => {
    if (customName && customURL) {
      setProviders([...providers, { name: customName, url: customURL, enabled: true }]);
      setCustomName("");
      setCustomURL("");
    }
  };

  return (
    <div className="App">
      <h1>🧲 Torrent Aggregator</h1>

      <h3>🔧 Provider Settings</h3>
      <ul>
        {providers.map(p => (
          <li key={p.name}>
            <label>
              <input
                type="checkbox"
                checked={p.enabled}
                onChange={() => toggleProvider(p.name)}
              />
              {p.name}
            </label>
          </li>
        ))}
      </ul>

      <h4>Add Custom Provider</h4>
      <input
        type="text"
        placeholder="Name"
        value={customName}
        onChange={e => setCustomName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Search URL"
        value={customURL}
        onChange={e => setCustomURL(e.target.value)}
      />
      <button onClick={addCustomProvider}>➕ Add</button>

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
