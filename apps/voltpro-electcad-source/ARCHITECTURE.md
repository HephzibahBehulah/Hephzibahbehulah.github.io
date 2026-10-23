# Architecture notes

## Core principles
- Separate the visual schematic from electrical semantics.
- Every entity receives a stable ID.
- Store coordinates in logical grid units, not CSS pixels.
- Use schema versions for saved projects.
- Make rules and symbol definitions traceable and testable.
- Keep CAD import/export behind adapters so vendor-specific libraries can be changed.

## Proposed project schema (future)
```ts
type Project = {
  schemaVersion: number;
  id: string;
  name: string;
  units: "mm";
  sheets: Sheet[];
};
type Sheet = {
  id: string;
  name: string;
  width: number;
  height: number;
  symbols: SymbolInstance[];
  wires: Wire[];
};
type SymbolInstance = {
  id: string;
  libraryId: string;
  reference: string;
  value?: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  properties: Record<string, string | number | boolean>;
  ports: Port[];
};
type Port = { id: string; name: string; x: number; y: number; electricalType: string };
type Wire = { id: string; from: { symbolId: string; portId: string }; to: { symbolId: string; portId: string }; netId?: string; label?: string };
```

## API currently provided
- `GET /api/health` — health check
- `GET /api/projects` — demo project list
- `POST /api/projects` — create an in-memory project
- `GET /api/projects/:id` — read an in-memory project

The API uses in-memory storage and resets when the server restarts. This is intentional for the initial scaffold.

## Security and correctness
- Validate every request body and query.
- Add rate limiting, CORS allow-list, authentication, and authorization before public deployment.
- Do not accept arbitrary file paths or shell commands from clients.
- Never treat a visual wire crossing as a junction unless the model says it is connected.
- Electrical design rules depend on application domain and applicable standards; require qualified review.
