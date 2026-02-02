import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";

export default function Profile({ me }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const userId = Number(id);
  const isMe = me?.id === userId;

  async function load() {
    setErr("");
    const d = await api.profile(userId);
    setData(d);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // NOTE: Backend currently returns counts but not "am I following?"
  // We'll do a minimal follow/unfollow UI that always tries follow first.
  async function follow() {
    await api.follow(userId);
    await load();
  }

  async function unfollow() {
    await api.unfollow(userId);
    await load();
  }

  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!data) return <div style={{ padding: 16 }}>Loading…</div>;

  const { profile, items, follower_count, following_count } = data;

  return (
    <div style={{ padding: 16 }}>
      <h2>@{profile.username}</h2>
      <div style={{ opacity: 0.8 }}>
        Followers: {follower_count} • Following: {following_count}
      </div>

      {!isMe && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={follow}>Follow</button>
          <button onClick={unfollow}>Unfollow</button>
        </div>
      )}

      <h3 style={{ marginTop: 16 }}>Items</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {items.map((it) => (
          <li key={it.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <Link to={`/items/${it.id}`} style={{ fontWeight: 800 }}>{it.title}</Link>
            <div>{it.creator} • {it.type}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}