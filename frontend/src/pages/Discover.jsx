import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const TYPE_OPTIONS = ["all", "book", "game", "movie", "music", "show"];

export default function Discover() {
  const [q, setQ] = useState("");
  const [sortType, setSortType] = useState("all");
  const [sort, setSort] = useState("newest");
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const [type, setType] = useState("Book");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [details, setDetails] = useState("");
/*
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
*/

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const data = await api.discover(q);
        setItems(Array.isArray(data) ? data : data.items ?? []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [q]);

  async function createItem(e) {
    e.preventDefault();
    setErr("");
    try {
      const newItem = await api.createItem({ type, title, creator, details });
      setItems((prev) => [newItem, ...prev]);
      setTitle("");
      setCreator("");
      setDetails("");
    } catch (e) {
      setErr(e.message);
    }
  }

  const visible = useMemo(() => {
    let list = [...items];

    if (sortType !== "all") {
      list = list.filter((it) => (it.type ?? "").toLowerCase() === sortType);
    }

    if (sort === "title") {
      list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    } else if (sort === "creator") {
      list.sort((a, b) => (a.creator ?? "").localeCompare(b.creator ?? ""));
    }

    return list;
  }, [items, sortType, sort]);


  return (
    <div style={{ padding: 16 }}>
      <div>
        <h2>Discover</h2>
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
        />
        <label>
          Type{" "}
          <select className="input" value={sortType} onChange={(e) => setSortType(e.target.value)}>
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort{" "}
          <select className="input"value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="title">Title</option>
            <option value="creator">Creator</option>
          </select>
        </label>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Add a new item</h3>
        <form onSubmit={createItem} style={{ display: "grid", gap: 8 }}>
          <label>
            Type
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="book">Book</option>
              <option value="movie">Movie</option>
              <option value="show">Show</option>
              <option value="game">Game</option>
              <option value="music">Music</option>
            </select>
          </label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
          <input className="input" value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="Creator" required />
          <input className="input" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details (optional)" />
          <button>Create</button>
        </form>
      </div>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {visible.map((it) => (
          <li key={it.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <Link to={`/items/${it.id}`} style={{ fontWeight: 800 }}>{it.title}</Link>
            <div>{it.creator} • {it.type.charAt(0).toUpperCase() + it.type.slice(1)}</div>
            {it.details && <div style={{ opacity: 0.8, marginTop: 6 }}>{it.details}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}