import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Feed() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const data = await api.feed();
        setItems(data);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Feed</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {items.map((it) => (
          <li key={it.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <Link to={`/items/${it.id}`} style={{ fontWeight: 800 }}>{it.title}</Link>
            <div>{it.creator} • {it.type.charAt(0).toUpperCase() + it.type.slice(1)} • <span className="added">Added by <Link to={`/users/${it.user?.id ?? it.user_id}`}>
                              {it.user?.username.charAt(0).toUpperCase() + it.user?.username.slice(1) ?? "unknown"}
                              {it.is_mine ? " (you)" : ""}
                            </Link></span></div>
            {it.details && <div style={{ opacity: 0.8 }}>{it.details}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}