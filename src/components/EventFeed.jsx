export default function EventFeed({ events }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h2>Event Feed</h2>

      {events.map((e, i) => (
        <div key={i}>
          {new Date(e.timestamp).toLocaleTimeString()} — {e.type}{" "}
          {e.app || ""}
        </div>
      ))}
    </div>
  );
}