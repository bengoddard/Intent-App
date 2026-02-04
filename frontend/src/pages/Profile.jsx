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
  }, [id]);

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

  const { profile, reviews, items, follower_count, following_count } = data;

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

      <h3 style={{ marginTop: 18 }}>Reviews</h3>

      {(!reviews || reviews.length === 0) ? (
      <div style={{ opacity: 0.7 }}>No reviews yet.</div>
      ) : (
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {reviews.map((r) => (
      <li
        key={`${r.user_id}-${r.media_id}`}
        style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}
      >
        <Link to={`/items/${r.media_id}`} style={{ fontWeight: 800 }}>
          {r.media_item?.title ?? `Item #${r.media_id}`}
        </Link>

        <div style={{ opacity: 0.85, marginTop: 4 }}>
          {r.media_item?.creator ? `${r.media_item.creator} • ` : ""}
          Rating: {r.rating} •{" "}
          {(r.media_item?.type ?? "").charAt(0).toUpperCase() + (r.media_item?.type ?? "").slice(1)}
        </div>

        {r.text && <div style={{ marginTop: 8 }}>{r.text}</div>}

        {r.created_at && (
          <div style={{ opacity: 0.7, marginTop: 8 }}>
            {r.created_at}
          </div>
        )}
        </li>
        ))}
      </ul>
      )}

      <h3 style={{ marginTop: 16 }}>Media</h3>
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