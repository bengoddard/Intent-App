import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function Item() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  async function load() {
    setErr("");
    const d = await api.item(id);
    setData(d);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (err) return <div style={{ padding: 16, color: "crimson" }}>{err}</div>;
  if (!data) return <div style={{ padding: 16 }}>Loading…</div>;

  const { item, reviews, my_list_entry } = data;

  return (
    <div style={{ padding: 16, maxWidth: 800 }}>
      <h2>{item.title}</h2>
      <div>{item.creator} • {item.type}</div>
      {item.details && <p style={{ opacity: 0.85 }}>{item.details}</p>}

      <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
        {!my_list_entry ? (
          <button onClick={addToList}>Add to To-Experience</button>
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

      <h3>Write a review</h3>
      <form onSubmit={submitReview} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <label>
          Rating (1–5)
          <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} />
        </label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Thoughts…" />
        <button>Submit</button>
      </form>

      <h3 style={{ marginTop: 18 }}>Reviews</h3>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {reviews.map((r) => (
          <li key={`${r.user_id}-${r.media_id}`} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ fontWeight: 800 }}>Rating: {r.rating}</div>
            {r.text && <div>{r.text}</div>}
            <div style={{ opacity: 0.7, marginTop: 6 }}>User #{r.user_id}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}