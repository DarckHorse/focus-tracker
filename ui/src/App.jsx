import "./App.css";
import { useEffect, useState } from "react";

function Section({ title, children }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function AppList({ items, emptyText }) {
  if (!items.length) return <div className="empty">{emptyText}</div>;

  return (
    <div className="chip-list">
      {items.map((item) => (
        <span key={item} className="chip">
          {item}
        </span>
      ))}
    </div>
  );
}

function EventFeed({ events }) {
  return (
    <div className="feed">
      {events.map((event, index) => (
        <div
          key={`${event.timestamp}-${event.type}-${event.app || index}`}
          className="feed-row"
        >
          <span className="feed-time">
            {new Date(event.timestamp).toLocaleTimeString()}
          </span>
          <span className="feed-type">{event.type}</span>
          <span className="feed-app">{event.app || "-"}</span>
        </div>
      ))}
    </div>
  );
}

function SessionTimeline({ sessions }) {
  if (!sessions.length) return <div className="empty">No sessions yet</div>;

  const starts = sessions.map((s) => new Date(s.start).getTime());
  const ends = sessions.map((s) => new Date(s.end).getTime());
  const minTime = Math.min(...starts);
  const maxTime = Math.max(...ends);
  const total = Math.max(maxTime - minTime, 1);

  return (
    <div className="timeline">
      {sessions.map((session, index) => {
        const start = new Date(session.start).getTime();
        const end = new Date(session.end).getTime();
        const left = ((start - minTime) / total) * 100;
        const width = Math.max(((end - start) / total) * 100, 1);

        return (
          <div
            key={`${session.app}-${session.lane}-${session.start}-${index}`}
            className="timeline-row"
          >
            <div className="timeline-label">
              <span>{session.app}</span>
              <span className="timeline-lane">{session.lane}</span>
            </div>
            <div className="timeline-track">
              <div
                className={`timeline-bar ${session.lane}`}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [model, setModel] = useState(null);
  const [backgroundOpen, setBackgroundOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadModel() {
      const nextModel = await window.focusTracker.getBehaviorModel();
      if (mounted) setModel(nextModel);
    }

    loadModel();

    const interval = setInterval(loadModel, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!model) {
    return (
      <div className="page">
        <div className="shell">Loading...</div>
      </div>
    );
  }

  const mergedBackground = [
    ...model.currentState.background,
    ...model.currentState.persistent,
  ];

  const sortedBackground = [...new Set(mergedBackground)].sort((a, b) =>
    a.localeCompare(b)
  );

  return (
    <div className="page">
      <div className="shell">
        <header className="hero">
          <h1>Focus Tracker</h1>
          <p>Behavior telemetry across apps, workspace, and sessions.</p>
        </header>

        <Section title="Current State">
          <div className="state-grid">
            <div className="state-card">
              <h3>Workspace</h3>
              <AppList
                items={model.currentState.workspace}
                emptyText="No visible apps"
              />
            </div>

            <div className="state-card">
              <button
                className="card-toggle"
                onClick={() => setBackgroundOpen((open) => !open)}
              >
                <h3>Background</h3>
                <span>
                  {backgroundOpen
                    ? "Hide"
                    : `Show (${sortedBackground.length})`}
                </span>
              </button>

              {backgroundOpen && (
                <AppList
                  items={sortedBackground}
                  emptyText="No background apps"
                />
              )}
            </div>
          </div>
        </Section>

        <Section title="Event Feed">
          <EventFeed events={model.eventFeed} />
        </Section>

        <Section title="Session Timeline">
          <SessionTimeline sessions={model.sessions} />
        </Section>
      </div>
    </div>
  );
}