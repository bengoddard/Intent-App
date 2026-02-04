import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

function timeAgo(isoDateOrYYYYMMDD) {
  if (!isoDateOrYYYYMMDD) return "";
  const d = new Date(isoDateOrYYYYMMDD);
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function Item({ me }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  async function load() {
    setErr("");
    const d = await api.item(id);
    setData(d);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, [id]);

  async function addToList() {
    await api.addToList(Number(id));
    await load();
  }

  async function removeFromList() {
    await api.removeFromList(Number(id));
    await load();
  }

  async function setStatus(status) {
    await api.setListStatus(Number(id), status);
    await load();
  }

  async function submitReview(e) {
    e.preventDefault();
    await api.reviewUpsert({ media_id: Number(id), rating: Number(rating), text });
    setText("");
    await load();
  }

  async function deleteMyReview() {
    await api.reviewDelete(Number(id));
    setText("");
    setRating(0);
    await load();
  }

  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!data) return <div style={{ padding: 16 }}>Loading…</div>;

  const { item, reviews, my_list_entry } = data;

  const myReview =
  me && data?.reviews ? data.reviews.find((r) => r.user_id === me.id) : null;

  return (
    <div style={{ padding: 16, maxWidth: 800 }}>
      <h2>{item.title}</h2>
      <div>
        {item.creator} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
      </div>
      {item.details && <p style={{ opacity: 0.85 }}>{item.details}</p>}

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {!my_list_entry ? (
          <button onClick={addToList}>Add to Experience</button>
        ) : (
          <>
            <button onClick={removeFromList}>Remove</button>
            {my_list_entry.status ? (
              <button onClick={() => setStatus(false)}>Mark uncompleted</button>
            ) : (
              <button onClick={() => setStatus(true)}>Mark completed</button>
            )}
          </>
        )}
      </div>

      <h3>{myReview ? "Edit your review" : "Write a review"}</h3>
      <form onSubmit={submitReview} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <label>
          Rating (0–100)
          <input
            type="number"
            min="0"
            max="100"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Thoughts…" />
        <button>{myReview ? "Update" : "Submit"}</button>
      </form>

      {myReview && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => {
              setRating(myReview.rating);
              setText(myReview.text || "");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{ marginRight: 8 }}
          >
            Load my review into editor
          </button>
          <button onClick={deleteMyReview}>Delete my review</button>
        </div>
      )}

      <h3 style={{ marginTop: 18 }}>Reviews</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {reviews.map((r) => {
          const username = r.user?.username ?? "unknown";
          const isMine = me?.id === r.user_id;

          return (
            <li
              key={`${r.user_id}-${r.media_id}`}
              style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}
            >
              <div style={{ fontWeight: 800 }}>Rating: {r.rating}</div>
              {r.text && <div>{r.text}</div>}

              <div style={{ opacity: 0.75, marginTop: 6 }}>
                By{" "}
                <Link to={`/users/${r.user?.id ?? r.user_id}`}>
                  @{username}
                  {isMine ? " (you)" : ""}
                </Link>
                {r.created_at ? ` • ${timeAgo(r.created_at)}` : ""}
              </div>

              {isMine && (
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => {
                      setRating(r.rating);
                      setText(r.text || "");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={deleteMyReview}>Delete</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
