import MediaCard from "./MediaCard";

function MediaList({ items, token, onUpdated, onDeleted }){
    return (
    <div style={{ marginTop: 16 }} className="container">
      <h2>Your Items</h2>

      {items.length === 0 ? (
        <p>No media yet. Create one above.</p>
      ) : (
        items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            token={token}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        ))
      )}
    </div>
  );
}

export default MediaList