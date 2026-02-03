import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Discover() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const [type, setType] = useState("Book");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [details, setDetails] = useState("");

  async function runSearch(query) {
    setErr("");
    try {
      const data = await api.discover(query);
      setItems(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    runSearch("");
  }, []);

  async function createItem(e) {
    e.preventDefault();
    setErr("");
    try {
      const newItem = await api.createItem({ type, title, creator, details });
      // show it at top + clear
      setItems((prev) => [newItem, ...prev]);
      setTitle("");
      setCreator("");
      setDetails("");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ padding: 16, display: "grid", gap: 18 }}>
      <div>
        <h2>Discover</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(q);
          }}
          style={{ display: "flex", gap: 8, marginTop: 10 }}
        >
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." style={{ flex: 1 }} />
          <button>Search</button>
        </form>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, maxWidth: 700 }}>
        <h3 style={{ marginTop: 0 }}>Add a new item</h3>
        <form onSubmit={createItem} style={{ display: "grid", gap: 8 }}>
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="book">Book</option>
              <option value="movie">Movie</option>
              <option value="show">Show</option>
              <option value="game">Game</option>
              <option value="music">Music</option>
            </select>
          </label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
          <input value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="Creator" required />
          <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details (optional)" />
          <button>Create</button>
        </form>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {items.map((it) => (
          <li key={it.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <Link to={`/items/${it.id}`} style={{ fontWeight: 800 }}>{it.title}</Link>
            <div>{it.creator} • {it.type.charAt(0).toUpperCase() + it.type.slice(1)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}