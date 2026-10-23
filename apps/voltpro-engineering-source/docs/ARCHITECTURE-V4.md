# VoltPRo Architecture V4

## Canonical runtime

UI -> Project Model -> Device Graph -> Terminal Graph -> Net Resolver -> Behaviour Engine -> Electrical Solver -> State Store -> Renderer.

The UI never performs circuit mathematics. The solver never owns UI state. Device definitions are catalogue data; executable behaviour is supplied by versioned model adapters.

## Core invariants

1. Every electrically meaningful endpoint is a stable terminal ID.
2. A wire connects terminals, never anonymous screen coordinates.
3. Nets are derived from terminal connectivity and may be recomputed deterministically.
4. Device behaviour may change terminal connectivity, but only through explicit contact/state rules.
5. Electrical state and device state are separate stores.
6. Projects are versioned and migratable.
7. Rendering is a projection of project state, never the source of truth.
8. Simulation is deterministic for identical project + options + seed.
9. A catalogue record is not considered simulation-capable until an executable model and acceptance tests exist.
10. Safety messaging must clearly distinguish educational simulation from real installation approval.

## Canonical device model

A device has identity, terminals, parameters, state and an executable model ID. Multi-contact devices are not collapsed into two-terminal approximations.

## Canonical wire model

Wires contain endpoints plus route segments and engineering metadata. The renderer may generate a route, but the project stores the route once accepted by the user.

## Licensing

The repository is Apache-2.0. Component catalogue data and third-party assets must retain their own attribution and licence metadata. VoltPRo-created symbols and assets are marked as original project assets.
