import React, { useState } from "react";

function MediaCard({ item, token, onUpdated, onDeleted }){
  const [isEditing, setIsEditing] = useState(false);

  const [type, setType] = useState(item.type || "");
  const [title, setTitle] = useState(item.title || "");
  const [creator, setCreator] = useState(item.creator || "");
  const [details, setDetails] = useState(item.details || "");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function saveEdits() {
    setIsSaving(true);
    setError("");

    fetch(`http://localhost:5555/items/${item.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, title, creator, details }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => null);

        if (r.ok) {
          onUpdated?.(data);
          setIsEditing(false);
        } else {
          setError(
            (data && (data.errors?.[0] || data.error)) ||
              "Could not update item."
          );
        }
      })
      .finally(() => setIsSaving(false));
  }

  function deleteItem() {
    const ok = window.confirm("Delete this item?");
    if (!ok) return;

    setIsSaving(true);
    setError("");

    fetch(`http://localhost:5555/items/${item.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        if (r.ok || r.status === 204) {
          onDeleted?.(item.id);
        } else {
          const data = await r.json().catch(() => null);
          setError(
            (data && (data.errors?.[0] || data.error)) ||
              "Could not delete item."
          );
        }
      })
      .finally(() => setIsSaving(false));
  }

  function cancelEdit() {
    setType(item.notes || "");
    setTitle(item.title || "");
    setCreator(item.creator || "");
    setDetails(item.details || "");
    setError("");
    setIsEditing(false);
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }} className="card">
      {!isEditing ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <h3 style={{ margin: "0 0 6px 0" }}>{item.title}</h3>
              <div style={{ fontSize: 14, opacity: 0.85 }}>
                <div><strong>Type:</strong> {item.type}</div>
                <div><strong>Details:</strong> {item.details}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Button onClick={() => setIsEditing(true)} disabled={isSaving}>
                Edit
              </Button>
              <Button onClick={deleteItem} disabled={isSaving}>
                Delete
              </Button>
            </div>
          </div>

          {error ? <p style={{ color: "crimson", marginTop: 10 }}>{error}</p> : null}
        </>
      ) : (
        <>
          <h3 style={{ marginTop: 0 }}>Edit Item</h3>

        <div style={{ display: "grid", gap: 10 }}>
            <label>
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              >
                <option value="book">Book</option>
                <option value="show">Show</option>
                <option value="movie">Movie</option>
                <option value="game">Game</option>
                <option value="music">Music</option>
              </select>
            </label>

            <label>
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>

            <label>
              Creator
              <input
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>

            <label>
              Details
              <input
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Button onClick={saveEdits} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button onClick={cancelEdit} disabled={isSaving}>
              Cancel
            </Button>
          </div>

          {error ? <p style={{ color: "crimson", marginTop: 10 }}>{error}</p> : null}
        </>
      )}
    </div>
  );
}

export default MediaCard