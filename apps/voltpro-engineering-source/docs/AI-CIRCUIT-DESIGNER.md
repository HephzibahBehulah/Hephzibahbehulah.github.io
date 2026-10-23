# VoltPRo Circuit Designer

The simulator's AI Circuit Designer is currently a deterministic, template-backed prompt planner. It creates editable VoltPRo component and wire objects; it does not generate a raster diagram or send prompts to a remote AI service.

## Supported first-release templates

- Low-voltage battery, resistor and lamp series circuit.
- Low-voltage battery, resistor and LED series circuit.
- Battery, switch and lamp circuit.
- Three-phase source connected phase-by-phase to a three-pole circuit breaker.
- Three-phase motor-starter topology draft with a three-pole breaker, contactor, motor, 24 V control source and normally-open start pushbutton.

The user receives a preview with component faces, terminal-to-terminal connections, topology validation and warnings. Nothing is inserted into the canvas until the user confirms. Supported follow-up prompts can update an existing simple draft (for example, changing a single DC source voltage or resistor value, or adding a switch to a simple series circuit). Ambiguous edits that cannot be safely mapped to a single component are not applied. Unsupported requests do not produce an insertable draft.

## Electrical model boundaries

The terminal graph defines stable local terminal IDs and device internal paths separately from symbol geometry and device-face rendering. Legacy numeric pin references are adapted to the corresponding named terminal IDs before topology validation. Wires inherit terminal domains when the project has not explicitly set a wire domain, and phase-labelled terminals are checked for phase mismatch.

A topology-valid design is not necessarily simulation-ready. The current legacy solver does not provide a complete three-phase motor-starter simulation. The starter template omits overload selection, short-circuit coordination, protective-earth routing, emergency stop, holding/seal-in logic and installation-specific engineering checks. It must not be used as a construction or commissioning plan.

## Symbols and physical faces

- IEC-style schematic symbols are the default.
- Terminal-block and simplified symbol views are selectable in the simulator toolbar.
- Device-face previews show terminal labels for known multi-terminal devices in the AI review panel and the DIN-rail Panel Designer, including a larger selected-device preview.
- Manufacturer dimensions are shown only when metadata explicitly marks both dimensions as verified. Otherwise the face is labelled `DIMENSIONS NOT VERIFIED`.

Catalogue-only or generic geometry must not be presented as manufacturer-certified. Verify part-specific dimensions, ratings, terminal numbering and installation constraints against the exact manufacturer's documentation and applicable standards.

## Tests

Run the focused suites:

```sh
node --test tests/terminal-engine.test.js tests/v5-runtime-terminal-mapping.test.js tests/ai-circuit-planner.test.js tests/device-face-renderer.test.js
```

Run the full repository suite with `npm test`.
