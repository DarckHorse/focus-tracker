export default function SessionTimeline({ sessions }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h2>Sessions</h2>

      {sessions.map((s, i) => (
        <div key={i}>
          {s.app} [{s.lane}] — {new Date(s.start).toLocaleTimeString()} →{" "}
          {new Date(s.end).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}