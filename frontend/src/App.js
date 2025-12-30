import { useState } from "react"

const API_BASE = "http://localhost:3000"

function App() {
  const [content, setContent] = useState("")
  const [ttl, setTtl] = useState("")
  const [maxViews, setMaxViews] = useState("")
  const [result, setResult] = useState("")
  const [error, setError] = useState("")

  const createPaste = async () => {
    setError("")
    setResult("")

    if (!content.trim()) {
      setError("Content is required")
      return
    }

    const payload = {
      content
    }

    if (ttl) payload.ttl_seconds = Number(ttl)
    if (maxViews) payload.max_views = Number(maxViews)

    try {
      const res = await fetch(`${API_BASE}/api/pastes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      setResult(data.url)
      setContent("")
      setTtl("")
      setMaxViews("")
    } catch (err) {
      setError("Server not reachable")
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Pastebin Lite</h2>

      <textarea
        rows="8"
        placeholder="Enter text..."
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="TTL (seconds)"
        value={ttl}
        onChange={e => setTtl(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="number"
        placeholder="Max views"
        value={maxViews}
        onChange={e => setMaxViews(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <button onClick={createPaste}>Create Paste</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <p>
          Shareable link: <a href={result}>{result}</a>
        </p>
      )}
    </div>
  )
}

export default App
