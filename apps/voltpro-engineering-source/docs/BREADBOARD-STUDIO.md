# Breadboard Studio — 2026-10-17

The dedicated `breadboard.html` page now opens as a physical electronics workbench.
This is an original implementation built on VoltPRo's board geometry and shared MNA
engine. The reference product was inspected for workflows; its source code, artwork,
component models and assets were not copied.

## Available workflows

- Physical 830-point board with split power rails, five-hole strips and a center trench.
- Canvas zoom/pan, minimap, placement previews, part dragging and wire selection.
- Searchable palette with real R/L/C/diode/source/switch parts and executable Arduino Uno R3, classic Nano, Raspberry Pi Pico/Pico 2, and ESP32 DevKitC board targets. Each board uses its registered terminal map; Raspberry Pi 5 remains reference-only and is not offered as an executable target.
- Select / Wire / Probe tools. Hole probes use actual connected strips, with source
  negative as the voltage reference. The alternate Grid view provides accessible hole buttons.
- Editable electrical values, engineering-prefix parsing, resistor sliders, generator
  frequency, switch interaction, terminal reversal, rotate, delete and 100-step undo/redo.
- Six wired experiments: LED, divider, RC charging, AC filter, switched LED and RL response.
- Shared MNA DC operating-point and backward-Euler transient analysis. Displayed signal
  traces are computed from actual component terminal connectivity; capacitor/inductor
  histories and sinusoidal inputs use the engine verified by analytical tests.
- Scope captures with voltage statistics, sampled playback cursor and primary-trace CSV.
- Named browser-local saving, auto-save, import/export of existing `.vbb.json` projects.
- Visible LED illumination from the captured signal and resistor bands based on resistance.

## Measurement meaning

The right-hand measurements are DC operating-point values. Zero-offset sine sources
have zero DC bias. Scope shows their alternating waveforms and transient behavior.

Run replays a precomputed capture from zero initial reactive energy. The Replay slider
inspects recorded samples; it is not microprocessor time travel. Component edits cause
a fresh capture, rather than pretending to preserve uncomputed energy or firmware state.

Native rail splits and the center trench stay electrically separate until explicitly
connected. Geometric wire crossings do not create junctions. A leg pair on the same
net is reported as a shorted footprint. Unconnected probe strips return no measurement.
Errors clear stale traces instead of substituting decorative data.

## Model limits and the next stages

- Breadboard board targets run a bounded GPIO teaching sketch through the interpreter and electrical network solver. The Uno R3, classic Nano, Pico, Pico 2 and ESP32 DevKitC expose their registered physical terminals, voltage levels and pin directions; they do not emulate native CPU instructions, interrupts, Wi-Fi/Bluetooth, USB or vendor SDKs. Raspberry Pi 5 is a Linux computer and remains reference-only, so it is not exposed as an executable breadboard part.
- No Wi-Fi, Bluetooth, Zigbee, Matter, USB device emulation, serial terminal, MicroPython
  runtime, peripheral bus models, display-driver emulation or cloud project syncing.
- One fixed 830-point board; no freely movable/multiple boards or arbitrary external
  board-pin connections. Broader board geometry needs a versioned project schema.
- Photoresistor and variable-resistor controls directly adjust resistance. They do not
  claim calibrated optical models or a three-terminal potentiometer.
- Captures have a fixed interval and support at most 80 electrical parts. There is no
  adaptive solver or trigger acquisition. Model accuracy is educational.
- Old capacitor footprints without declared terminal holes require re-placement before
  analysis. Future project versions are rejected rather than destructively downgraded.

The recommended next implementation order is: external connector and multi-board topology with explicit off-board terminals; broader peripheral buses and timing models; then additional, independently tested sensor/display integrations. Native CPU, Wi-Fi and vendor SDK emulation require separate runtime designs. Each addition needs behavioral tests, not just a palette thumbnail.

## Verification

Run `npm test`. New behavioral tests cover real strip topology, split rails, jumper links,
RC charging, a repeated save/load divider, LED polarity, switches, AC bias and waveform,
engineering-unit parsing, shorted footprints, unsupported firmware and resistor bands.
Browser checks cover examples, actual probes, the scope, undo/redo and local project loading.
