import { useState, useEffect, useRef, useCallback } from "react";

const BROKERS = [
  { id: "col", name: "COL Financial", icon: "📊", color: "#0066CC" },
  { id: "firstmetro", name: "First Metro Sec", icon: "🏦", color: "#004D40" },
  { id: "bpi", name: "BPI Trade", icon: "💹", color: "#CC0000" },
  { id: "metrobank", name: "Metrobank Securities", icon: "🔷", color: "#003399" },
  { id: "abcap", name: "AB Capital Securities", icon: "📈", color: "#1B5E20" },
  { id: "philstocks", name: "Philstocks", icon: "🇵🇭", color: "#FF6F00" },
  { id: "aaasec", name: "AAA Southeast Equities", icon: "⚡", color: "#6A1B9A" },
  { id: "gotrade", name: "GoTrade", icon: "🌐", color: "#00C853" },
  { id: "etoro", name: "eToro", icon: "🌍", color: "#4CAF50" },
  { id: "ibkr", name: "Interactive Brokers", icon: "🔴", color: "#D32F2F" },
  { id: "webull", name: "Webull", icon: "🐂", color: "#FF5722" },
  { id: "other", name: "Other Broker", icon: "🏢", color: "#607D8B" },
];

const FALLBACK_STOCKS = [
  { symbol: "GOOG", name: "Alphabet Inc", sector: "Technology" },
  { symbol: "AAPL", name: "Apple Inc", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc", sector: "Automotive" },
  { symbol: "NVDA", name: "NVIDIA Corp", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms", sector: "Technology" },
];

const formatCurrency = (val, currency = "USD") => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  if (currency === "PHP") return `₱${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercent = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
};

// ─── API Key Setup ───

function ApiKeySetup({ onSave, savedKey }) {
  const [key, setKey] = useState(savedKey || "");
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(savedKey ? "success" : null);

  const testKey = async () => {
    if (!key.trim()) return;
    setTesting(true);
    setStatus(null);
    try {
      const res = await fetch(`https://api.twelvedata.com/price?symbol=AAPL&apikey=${key.trim()}`);
      const data = await res.json();
      if (data.price) {
        setStatus("success");
        onSave(key.trim());
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
    setTesting(false);
  };

  return (
    <div style={{
      background: "#1a1a2e", borderRadius: 16, padding: 24,
      border: "2px solid #2a2a4a", marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🔑</span>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff" }}>Twelve Data API Key</h3>
        {savedKey && (
          <span style={{
            fontSize: 10, padding: "3px 10px", background: "#00c85318",
            color: "#00c853", borderRadius: 6, fontWeight: 700,
          }}>CONNECTED</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setStatus(null); }}
          placeholder="Paste your API key here..."
          style={{
            flex: 1, padding: "12px 16px", background: "#12121f",
            border: `2px solid ${status === "error" ? "#ff4444" : status === "success" ? "#00c853" : "#2a2a4a"}`,
            borderRadius: 10, color: "#fff", fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace", outline: "none",
          }}
        />
        <button
          onClick={testKey}
          disabled={testing || !key.trim()}
          style={{
            padding: "12px 20px",
            background: key.trim() ? "linear-gradient(135deg, #ffd700, #ffab00)" : "#2a2a4a",
            border: "none", borderRadius: 10,
            color: key.trim() ? "#000" : "#666",
            fontSize: 13, fontWeight: 800, cursor: key.trim() ? "pointer" : "default",
            fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", minWidth: 100,
          }}
        >{testing ? "Testing..." : savedKey ? "Update" : "Connect"}</button>
      </div>
      {status === "error" && (
        <p style={{ fontSize: 12, color: "#ff4444", margin: "10px 0 0", fontWeight: 600 }}>
          Invalid API key. Please check and try again.
        </p>
      )}
      {status === "success" && !savedKey && (
        <p style={{ fontSize: 12, color: "#00c853", margin: "10px 0 0", fontWeight: 600 }}>
          ✓ API key verified! Live prices are now active.
        </p>
      )}
      <p style={{ fontSize: 11, color: "#444", margin: "10px 0 0" }}>
        Get your free key at <span style={{ color: "#ffd700" }}>twelvedata.com</span> → Dashboard. For testing only — move to backend for production.
      </p>
    </div>
  );
}

// ─── Broker Selector ───

function BrokerSelector({ onSelect, selected }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
      {BROKERS.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b)}
          style={{
            background: selected?.id === b.id ? b.color + "18" : "#1a1a2e",
            border: selected?.id === b.id ? `2px solid ${b.color}` : "2px solid #2a2a4a",
            borderRadius: 12, padding: "14px 12px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
            color: selected?.id === b.id ? "#fff" : "#8888aa",
          }}
        >
          <span style={{ fontSize: 22 }}>{b.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textAlign: "left" }}>{b.name}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Stock Search with Twelve Data ───

function StockSearch({ onAdd, apiKey }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef();
  const debounceRef = useRef();

  const searchStocks = useCallback(async (q) => {
    if (!q || q.length < 1) { setResults([]); return; }
    if (apiKey) {
      setLoading(true);
      try {
        const res = await fetch(`https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(q)}&outputsize=8`);
        const data = await res.json();
        if (data.data) {
          setResults(data.data
            .filter((s) => s.instrument_type === "Common Stock" || s.instrument_type === "ETF")
            .slice(0, 8)
            .map((s) => ({ symbol: s.symbol, name: s.instrument_name, sector: s.exchange || "US", exchange: s.exchange }))
          );
        }
      } catch {
        setResults(FALLBACK_STOCKS.filter((s) => s.symbol.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8));
      }
      setLoading(false);
    } else {
      setResults(FALLBACK_STOCKS.filter((s) => s.symbol.toLowerCase().includes(q.toLowerCase()) || s.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8));
    }
  }, [apiKey]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length >= 1) {
      debounceRef.current = setTimeout(() => searchStocks(query), apiKey ? 400 : 100);
    } else { setResults([]); }
    return () => clearTimeout(debounceRef.current);
  }, [query, searchStocks, apiKey]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder={apiKey ? "Search any stock symbol or name..." : "Search stocks (connect API for full search)..."}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          style={{
            width: "100%", padding: "14px 18px", paddingRight: 40,
            background: "#12121f", border: "2px solid #2a2a4a",
            borderRadius: 12, color: "#fff", fontSize: 15,
            fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box",
          }}
        />
        {loading && (
          <div style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            width: 18, height: 18, border: "2px solid #ffd70044",
            borderTop: "2px solid #ffd700", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
        )}
        {apiKey && !loading && (
          <div style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            width: 8, height: 8, borderRadius: "50%", background: "#00c853",
          }} />
        )}
      </div>
      {open && query && results.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: "#1a1a2e", border: "2px solid #2a2a4a", borderRadius: 12,
          marginTop: 4, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          maxHeight: 320, overflowY: "auto",
        }}>
          {results.map((s, i) => (
            <button
              key={`${s.symbol}-${i}`}
              onClick={() => { onAdd(s); setQuery(""); setOpen(false); setResults([]); }}
              style={{
                width: "100%", padding: "12px 18px", background: "transparent",
                border: "none", borderBottom: "1px solid #2a2a4a", cursor: "pointer",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                color: "#fff", fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#25254a")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: "#ffd700", fontFamily: "'JetBrains Mono', monospace" }}>{s.symbol}</span>
                <span style={{ fontSize: 13, color: "#8888aa", textAlign: "left" }}>{s.name}</span>
              </div>
              <span style={{ fontSize: 10, padding: "3px 8px", background: "#2a2a4a", borderRadius: 6, color: "#8888aa", fontWeight: 600, flexShrink: 0 }}>{s.exchange || s.sector}</span>
            </button>
          ))}
        </div>
      )}
      {open && query && query.length >= 2 && results.length === 0 && !loading && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: "#1a1a2e", border: "2px solid #2a2a4a", borderRadius: 12,
          marginTop: 4, padding: "16px 18px", textAlign: "center", color: "#555", fontSize: 13,
        }}>No stocks found for "{query}"</div>
      )}
    </div>
  );
}

// ─── Add Holding Form ───

function AddHoldingForm({ stock, onSubmit, onCancel, apiKey }) {
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [livePrice, setLivePrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);

  useEffect(() => {
    if (!apiKey) return;
    setLoadingPrice(true);
    fetch(`https://api.twelvedata.com/quote?symbol=${stock.symbol}&apikey=${apiKey}`)
      .then((r) => r.json())
      .then((data) => { if (data.close) setLivePrice(parseFloat(data.close)); })
      .catch(() => {})
      .finally(() => setLoadingPrice(false));
  }, [stock.symbol, apiKey]);

  const handleSubmit = () => {
    if (!shares || !price) return;
    onSubmit({ ...stock, shares: parseFloat(shares), executionPrice: parseFloat(price), dateBought: date, id: Date.now().toString(), currency: "USD" });
  };

  return (
    <div style={{ background: "#12121f", borderRadius: 16, padding: 24, border: "2px solid #ffd70033", marginTop: 12, animation: "slideIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#ffd700", fontFamily: "'JetBrains Mono', monospace" }}>{stock.symbol}</span>
          <span style={{ fontSize: 14, color: "#8888aa" }}>{stock.name}</span>
        </div>
        <button onClick={onCancel} style={{ background: "transparent", border: "none", color: "#666", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      {apiKey && (
        <div style={{ padding: "10px 14px", background: "#0d0d18", borderRadius: 10, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Live Market Price</span>
          {loadingPrice ? (
            <span style={{ fontSize: 13, color: "#ffd700", fontFamily: "'JetBrains Mono', monospace" }}>Loading...</span>
          ) : livePrice ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00c853", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 16, fontWeight: 700, color: "#00c853", fontFamily: "'JetBrains Mono', monospace" }}>${livePrice.toFixed(2)}</span>
            </div>
          ) : (
            <span style={{ fontSize: 13, color: "#555" }}>Unavailable</span>
          )}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: "#666", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Shares</label>
          <input type="number" value={shares} onChange={(e) => setShares(e.target.value)} placeholder="0"
            style={{ width: "100%", padding: "12px 14px", background: "#0d0d18", border: "2px solid #2a2a4a", borderRadius: 10, color: "#fff", fontSize: 16, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#666", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Exec. Price ($)</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00"
            style={{ width: "100%", padding: "12px 14px", background: "#0d0d18", border: "2px solid #2a2a4a", borderRadius: 10, color: "#fff", fontSize: 16, fontFamily: "'JetBrains Mono', monospace", marginTop: 6, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: "#666", fontWeight: 700, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Date Bought</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", background: "#0d0d18", border: "2px solid #2a2a4a", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", marginTop: 6, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
      {shares && price && (
        <div style={{ marginTop: 16, padding: "12px 16px", background: "#0d0d18", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#666" }}>Total Cost</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#ffd700", fontFamily: "'JetBrains Mono', monospace" }}>{formatCurrency(parseFloat(shares) * parseFloat(price))}</span>
        </div>
      )}
      <button onClick={handleSubmit} disabled={!shares || !price}
        style={{
          width: "100%", marginTop: 16, padding: "14px",
          background: shares && price ? "linear-gradient(135deg, #ffd700, #ffab00)" : "#2a2a4a",
          border: "none", borderRadius: 12, color: shares && price ? "#000" : "#666",
          fontSize: 14, fontWeight: 800, cursor: shares && price ? "pointer" : "default",
          fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5, transition: "all 0.2s",
        }}>ADD TO PORTFOLIO</button>
    </div>
  );
}

// ─── Holding Card ───

function HoldingCard({ holding, onRemove, liveData }) {
  const currentPrice = liveData ? liveData.price : holding.executionPrice;
  const totalCost = holding.shares * holding.executionPrice;
  const marketValue = holding.shares * currentPrice;
  const gainLoss = marketValue - totalCost;
  const gainLossPercent = totalCost > 0 ? ((gainLoss / totalCost) * 100) : 0;
  const isPositive = gainLoss >= 0;
  const hasLive = liveData !== null && liveData !== undefined;
  const daysSinceBuy = Math.floor((Date.now() - new Date(holding.dateBought).getTime()) / 86400000);

  // Daily price change from quote endpoint
  const dailyChange = liveData?.change ?? null;
  const dailyPctChange = liveData?.percentChange ?? null;
  const isDailyPositive = dailyChange !== null ? dailyChange >= 0 : true;
  const isMarketOpen = liveData?.isMarketOpen ?? false;

  return (
    <div style={{ background: "#1a1a2e", borderRadius: 16, padding: 20, border: `1px solid ${isPositive ? "#00c85322" : "#ff444422"}`, transition: "all 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#ffd700", fontFamily: "'JetBrains Mono', monospace" }}>{holding.symbol}</span>
            {dailyPctChange !== null && (
              <span style={{
                fontSize: 10, padding: "3px 8px", borderRadius: 6,
                background: isDailyPositive ? "#00c85318" : "#ff444418",
                color: isDailyPositive ? "#00c853" : "#ff4444",
                fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              }}>
                {isDailyPositive ? "▲" : "▼"} {formatPercent(dailyPctChange)}
              </span>
            )}
            {hasLive && (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isMarketOpen ? "#00c853" : "#ffd700", animation: isMarketOpen ? "pulse 2s infinite" : "none" }} />
                <span style={{ fontSize: 9, color: isMarketOpen ? "#00c853" : "#ffd700", fontWeight: 600 }}>
                  {isMarketOpen ? "LIVE" : "CLOSED"}
                </span>
              </div>
            )}
          </div>
          <span style={{ fontSize: 12, color: "#666", marginTop: 2, display: "block" }}>{holding.name}</span>
        </div>
        <button onClick={() => onRemove(holding.id)} style={{ background: "transparent", border: "none", color: "#444", cursor: "pointer", fontSize: 16, padding: 4 }}>✕</button>
      </div>

      {/* Daily Price Change Bar */}
      {dailyChange !== null && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 14px", background: isDailyPositive ? "#00c85308" : "#ff444408",
          borderRadius: 10, marginBottom: 14,
          border: `1px solid ${isDailyPositive ? "#00c85315" : "#ff444415"}`,
        }}>
          <span style={{ fontSize: 10, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Today's Change</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              color: isDailyPositive ? "#00c853" : "#ff4444",
            }}>
              {isDailyPositive ? "+" : ""}{formatCurrency(dailyChange)}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
              color: isDailyPositive ? "#00c853" : "#ff4444",
              background: isDailyPositive ? "#00c85312" : "#ff444412",
              padding: "2px 8px", borderRadius: 4,
            }}>
              {formatPercent(dailyPctChange)}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div style={{ background: "#12121f", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Current Price {hasLive ? "" : "(est.)"}</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{formatCurrency(currentPrice)}</div>
        </div>
        <div style={{ background: "#12121f", borderRadius: 10, padding: "10px 14px" }}>
          <div style={{ fontSize: 10, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Avg. Cost</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#8888aa", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{formatCurrency(holding.executionPrice)}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={{ background: "#12121f", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Shares</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{holding.shares.toLocaleString()}</div>
        </div>
        <div style={{ background: "#12121f", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>Mkt Value</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{formatCurrency(marketValue)}</div>
        </div>
        <div style={{ background: "#12121f", borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>P&L</div>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", marginTop: 2, color: isPositive ? "#00c853" : "#ff4444" }}>
            {isPositive ? "+" : ""}{formatCurrency(gainLoss)}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #2a2a4a" }}>
        <span style={{ fontSize: 11, color: "#555" }}>Bought: {new Date(holding.dateBought).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        <span style={{ fontSize: 11, color: "#555" }}>{daysSinceBuy}d held</span>
        <span style={{ fontSize: 11, color: "#555" }}>Cost: {formatCurrency(totalCost)}</span>
      </div>
    </div>
  );
}

// ─── Main App ───

export default function LemoneydPortfolio() {
  const [apiKey, setApiKey] = useState("");
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [pendingStock, setPendingStock] = useState(null);
  const [view, setView] = useState("broker");
  const [livePrices, setLivePrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchLivePrices = useCallback(async () => {
    if (!apiKey || holdings.length === 0) return;
    setPricesLoading(true);
    try {
      const uniqueSymbols = [...new Set(holdings.map((h) => h.symbol))];
      const prices = {};
      // Use /quote endpoint for accurate close price + daily change
      for (const sym of uniqueSymbols) {
        try {
          const res = await fetch(`https://api.twelvedata.com/quote?symbol=${sym}&apikey=${apiKey}`);
          const data = await res.json();
          if (data.close) {
            prices[sym] = {
              price: parseFloat(data.close),
              previousClose: data.previous_close ? parseFloat(data.previous_close) : null,
              change: data.change ? parseFloat(data.change) : null,
              percentChange: data.percent_change ? parseFloat(data.percent_change) : null,
              isMarketOpen: data.is_market_open || false,
            };
          }
        } catch { /* skip */ }
      }
      setLivePrices(prices);
      setLastRefresh(new Date());
    } catch { console.error("Failed to fetch prices"); }
    setPricesLoading(false);
  }, [apiKey, holdings]);

  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLivePrices]);

  const totalMarketValue = holdings.reduce((sum, h) => {
    const lp = livePrices[h.symbol];
    const cp = lp ? lp.price : h.executionPrice;
    return sum + h.shares * cp;
  }, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.executionPrice, 0);
  const totalGainLoss = totalMarketValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d18", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "20px 16px 60px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, animation: "fadeIn 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>🍋</span>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, background: "linear-gradient(135deg, #ffd700, #ffab00)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>Lemoneyd</h1>
          </div>
          <p style={{ fontSize: 13, color: "#555", margin: 0, letterSpacing: 0.3 }}>Stock Portfolio Tracker</p>
        </div>

        <ApiKeySetup savedKey={apiKey} onSave={setApiKey} />

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#1a1a2e", borderRadius: 12, padding: 4 }}>
          {[{ id: "broker", label: "Select Broker" }, { id: "portfolio", label: `Portfolio${holdings.length > 0 ? ` (${holdings.length})` : ""}` }].map((tab) => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: view === tab.id ? "linear-gradient(135deg, #ffd700, #ffab00)" : "transparent", color: view === tab.id ? "#000" : "#666", transition: "all 0.2s" }}
            >{tab.label}</button>
          ))}
        </div>

        {view === "broker" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#8888aa", marginBottom: 16 }}>Which broker are you using?</h2>
            <BrokerSelector selected={selectedBroker} onSelect={(b) => { setSelectedBroker(b); setView("portfolio"); }} />
          </div>
        )}

        {view === "portfolio" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            {selectedBroker && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", background: selectedBroker.color + "18", borderRadius: 8, marginBottom: 20, border: `1px solid ${selectedBroker.color}44` }}>
                <span>{selectedBroker.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: selectedBroker.color }}>{selectedBroker.name}</span>
                <button onClick={() => setView("broker")} style={{ background: "transparent", border: "none", color: "#666", cursor: "pointer", fontSize: 12, marginLeft: 4 }}>Change</button>
              </div>
            )}
            {!selectedBroker && (
              <button onClick={() => setView("broker")} style={{ padding: "10px 18px", background: "#1a1a2e", border: "2px dashed #2a2a4a", borderRadius: 10, color: "#666", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>+ Select a Broker</button>
            )}

            {/* Portfolio Summary */}
            {holdings.length > 0 && (
              <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #12122a 100%)", borderRadius: 18, padding: 24, marginBottom: 24, border: "1px solid #2a2a4a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Total Portfolio Value</div>
                  {apiKey && (
                    <button onClick={fetchLivePrices} disabled={pricesLoading}
                      style={{ background: "#2a2a4a", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 10, color: "#8888aa", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                      {pricesLoading ? "Refreshing..." : "↻ Refresh"}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'JetBrains Mono', monospace", letterSpacing: -1 }}>
                  ${totalMarketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: totalGainLoss >= 0 ? "#00c853" : "#ff4444", animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: totalGainLoss >= 0 ? "#00c853" : "#ff4444", fontFamily: "'JetBrains Mono', monospace" }}>
                      {totalGainLoss >= 0 ? "+" : ""}${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: totalGainPct >= 0 ? "#00c853" : "#ff4444", fontFamily: "'JetBrains Mono', monospace", background: totalGainPct >= 0 ? "#00c85312" : "#ff444412", padding: "2px 10px", borderRadius: 6 }}>
                    {formatPercent(totalGainPct)}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 18, paddingTop: 16, borderTop: "1px solid #2a2a4a" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Total Cost</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#8888aa", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Holdings</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#8888aa", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{holdings.length} stock{holdings.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Last Update</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#8888aa", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{lastRefresh ? lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Add Stock */}
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#8888aa", marginBottom: 10 }}>Add a Stock</h3>
              <StockSearch apiKey={apiKey} onAdd={(stock) => setPendingStock(stock)} />
              {pendingStock && <AddHoldingForm stock={pendingStock} apiKey={apiKey} onSubmit={(h) => { setHoldings((prev) => [...prev, h]); setPendingStock(null); }} onCancel={() => setPendingStock(null)} />}
            </div>

            {/* Holdings */}
            {holdings.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#8888aa", marginBottom: 14 }}>Your Holdings</h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {holdings.map((h) => <HoldingCard key={h.id} holding={h} liveData={livePrices[h.symbol]} onRemove={(id) => setHoldings((prev) => prev.filter((x) => x.id !== id))} />)}
                </div>
              </div>
            )}

            {holdings.length === 0 && !pendingStock && (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#444", animation: "fadeIn 0.5s ease" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No holdings yet</p>
                <p style={{ fontSize: 12, color: "#333" }}>{apiKey ? "Search for any stock above to add your first holding" : "Connect your API key above, then search for stocks to add"}</p>
              </div>
            )}

            <div style={{ marginTop: 32, padding: "14px 16px", background: "#12121f", borderRadius: 10, borderLeft: `3px solid ${apiKey ? "#00c85344" : "#ffd70044"}` }}>
              <p style={{ fontSize: 10, color: "#444", margin: 0, lineHeight: 1.6 }}>
                {apiKey ? "🟢 Live prices powered by Twelve Data API. Prices auto-refresh every 5 minutes. This is not financial advice." : "⚠️ Connect your Twelve Data API key above for live prices. Without it, stocks will show your execution price as current price."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
