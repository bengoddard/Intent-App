import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function ToExperience() {
  const [entries, setEntries] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const d = await api.toExperience();
        setEntries(d);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>To-Experience</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {entries.map((en) => (
          <li key={`${en.user_id}-${en.media_id}`} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div>
              Item: <Link to={`/items/${en.media_id}`}>{en.media_id}</Link>
            </div>
            <div style={{ opacity: 0.8 }}>Added: {en.added_at}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}