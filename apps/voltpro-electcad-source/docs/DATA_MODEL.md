# Project and electrical data model

The browser document uses schema version 2 and contains project metadata, stable sheet IDs, component instances, wire segments and the active sheet ID. Import passes through runtime validation in src/editor-model.ts; schema version 1 is migrated to one sheet. Coordinates use logical drawing units. Components have stable instance IDs, a catalogue type ID, reference, value, position and optional rotation/custom electrical properties.

The component catalogue in src/component-library.ts currently provides 136 typed base component definitions grouped by category. Parametric variants can be generated on demand up to a caller-selected limit of 1,000,000; generated variants share a base symbol definition and are not equivalent to one million separately validated manufacturer parts.

The electrical graph remains incomplete. Wires are orthogonal polylines represented by endpoint coordinates; the net grouping algorithm distinguishes unconnected visual crossings. Full persistent port IDs, junction entities, automatic wire splitting/merging, stable net IDs and project-wide reference designation validation remain future work.

The DC solver derives pin locations from the current symbol model and resolves supported source/resistor/ground connections from wire geometry. It does not yet use a full port-to-net graph shared with the editor.
