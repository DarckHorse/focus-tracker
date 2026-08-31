export default function CurrentState({ state }) {
  return (
    <div>
      <h2>Current State</h2>

      <div>
        <strong>Workspace:</strong> {state.workspace.join(", ")}
      </div>

      <div>
        <strong>Background:</strong> {state.background.join(", ")}
      </div>

      <div>
        <strong>Persistent:</strong> {state.persistent.join(", ")}
      </div>
    </div>
  );
}