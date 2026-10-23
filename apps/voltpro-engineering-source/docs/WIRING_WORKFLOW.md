# VoltPRo terminal wiring workflow

## Interaction

- Select **Wire**, then click a terminal. The starting terminal is highlighted.
- Move the pointer to preview an orthogonal wire and click a terminal on another component to finish.
- Press **Escape** or click **Wire** again to cancel.
- Click a wire to select it; use **Delete** or the toolbar Delete button to remove it.
- Double-click a wire to add a routing bend at the pointer position.
- Shift-double-click a wire to place an explicit junction. Shift-double-click another wire at the same snapped coordinate to reuse that junction ID and electrically join the wires.
- Undo and redo include wire topology and routing metadata.

## Wire model

Each saved wire keeps stable terminal endpoint references in `a` and `b` (for example `cabc123:0` and `cdef456:1`). The `bends` and `junctions` fields are routing/display metadata and do not replace or rewrite endpoints. Endpoint coordinates are resolved from component position, terminal index, and component rotation on each render.

The route renderer uses horizontal and vertical segments. Moving or rotating a component recalculates the route from the current terminal positions. Crossings do not connect by geometry or proximity. A junction is electrical only when multiple wires explicitly carry the same junction ID; the simulation adapter expands those declared junctions into topology edges. Unmarked crossings remain isolated.

## Validation and history

The wiring controller rejects identical endpoints, terminals on the same component, and duplicate undirected connections. Invalid operations report a reason and keep the start terminal active so another destination can be selected. Wire creation and deletion are recorded in the existing project snapshot history.

## Tests

Run `npm test` with Node.js 22 or newer. `tests/wiring-workflow.test.js` covers orthogonal routes, routing bends, endpoint persistence, duplicate rejection, pointer preview/commit, invalid feedback, Escape/Delete keyboard handling, and explicit-junction versus crossing connectivity.
