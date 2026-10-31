# VoltPro engineering workspaces — functional specification

**Status:** implementation specification; not a conformity declaration.
**Scope:** VoltPro PLC, Simulator, ElectCAD, Breadboard, and Electrical Building.
**Repository baseline reviewed:** 2026-10-24.

> VoltPro is in active development. DRC rules and symbol libraries are pending verified standards ingestion and licensed catalog integration. Do not use for final production documentation.

## Compliance boundary

DIN EN 61082-1 governs presentation of electrotechnical documents (including diagrams, drawings, and tables); it does not define a reference-designation system. Reference-designation structure is specified separately, so the suite shall use a project-configured scheme based on DIN EN IEC 81346-1/-2 rather than claiming 61082 alone assigns tags. IEC 60617 is the authoritative graphical-symbol database for diagram symbols. The catalog is licensed: each production symbol must be sourced from a properly licensed database/export and retain its IEC reference number, title, source edition, and any project-specific variant metadata. Do not hand-draw an approximation and label it “IEC.”

DIN VDE 0100 is a series of more than 60 documents, with requirements selected by installation type and the relevant parts/editions. Electrical Building must require a declared project profile and show which checks are assessed, failed, or not assessed. A drawing or software check is not an installation approval, inspection, or substitute for qualified electrical design and commissioning.

The official public catalog pages establish scope and status, but do not expose the complete paid normative texts. This specification is therefore a standards-informed design basis, not a clause-by-clause verification. Before a release claims conformity, an authorized engineer must check the exact licensed editions, applicability, national requirements, symbol licensing, and verification evidence.

## Suite-wide interaction contract

- Keep one persistent charcoal OSINT shell across all five workspaces: top navbar, return-to-main-site link, language/theme/account actions, Adigun entry point, and bottom navigation. Tool changes update the route in the same tab and preserve the shell; tool-local documents may save state independently.
- Keep global navigation in this order: Simulator, PLC, ElectCAD, Engineering Tools, Breadboard, Electrical Building. Engineering Tools is a platform destination and not one of the five editors specified below.
- Each editor uses a single-row top bar, a compact command/menu row, discipline-specific left library/explorer, central canvas, contextual right inspector, and bottom status/diagnostics area. Collapse sidebars independently; the canvas gets the remaining width. No modal or chatbot may cover the active drawing area by default.
- Adigun opens as a docked, collapsible side panel or a small unobtrusive launcher. It receives the active project, selected object, tool context, and validation messages. It can suggest edits; it cannot silently change a drawing or present an unchecked safety conclusion.
- Every visible command has an implemented handler and an enabled/disabled reason. Unsupported export formats and unavailable catalog entries are absent or explicitly disabled with the reason. No dead menu entries, empty panels, fake live values, or generic-symbol fallbacks.
- Selection and drag/drop are keyboard reachable. Commands show shortcuts in menus; destructive actions offer undo or a clear confirmation. Save state and last-saved status are visible. All editable values are validated at entry and revalidated on import/export.
- Documents carry project identity, document number, revision, language, units, author/drafter, date, page/sheet, scale where relevant, and a project-configured reference-designation scheme. Unassigned identifiers are visibly reported and block a “checked” export profile.
- The status bar reports active tool, selection, coordinate/units, zoom, snap/grid state, dirty/saved state, simulation/scan state, and actionable diagnostics. Status is never inferred from decorative color alone.

## Common menus and actual command effects

The menu vocabulary is consistent; commands are enabled only where they have a real implementation for that document type.

| Menu | Commands and effect |
|---|---|
| **File** | New document (selects a real discipline template); Open (validates supported native project files); Save / Save As (writes the project and records revision metadata); Import (lists only supported formats and validates them); Export (opens implemented format choices and reports omitted/unsupported data); Print / Page setup (sets sheet, scale, margins, and title block); Project settings (units, language, designation scheme, profile); Close document (prompts only when dirty). |
| **Edit** | Undo / Redo (reverses committed model operations); Cut / Copy / Paste / Duplicate (preserves tags safely and assigns new unique tags when needed); Delete; Select all / none; Find / Replace (searches object tags, labels, values); Preferences (snap, keyboard, display). |
| **Draw** | Select; discipline-specific placement tools; wire/connection; junction/terminal; text/callout; measure; pan/zoom. Each tool changes the active interaction mode and can be escaped; no decorative-only toolbar icons. |
| **Tools** | Validate document; assign/check references; run discipline-specific analysis; open library/catalog manager; configure grid/snap; inspect connectivity; manage reports. A check names its ruleset/version and reports pass/fail/not assessed. |
| **View** | Show/hide project explorer, library, inspector, diagnostics, cross-reference, grid, rulers, labels; zoom in/out/fit/1:1; page/canvas view. Visibility toggles do not alter model data. |

## 1. VoltPro PLC — industrial control / ladder and function blocks

### Layout

- **Top:** persistent suite navbar; below it project title, controller/target profile, File/Edit/Draw/Tools/View menus, run/stop, undo/redo, and online/offline indication.
- **Left (collapsible):** project tree (controller, tasks/programs, I/O configuration, libraries) above a searchable IEC 61131-3 instruction/library palette. Dragging a contact, coil, timer, counter, or function block creates a typed node; inserting it checks the selected language and pin/rail compatibility.
- **Center:** rung-based LD canvas or typed FBD canvas selected per program. Rungs have stable numbers, left/right rails, aligned grid, explicit power flow, and orthogonal connections. Zoom and pan do not change logic. Switching language is an explicit conversion with a loss report, not an assumed visual mode.
- **Right (collapsible):** selected instruction properties, tag binding, data type, address, timer preset, pin state, and documentation. Invalid type/address values prevent execution/export.
- **Bottom:** scan/watch table, diagnostics, trace, and status; runtime values only appear when the simulator is running and are marked simulated.

### Commands

- **File:** New PLC project; Open/Save/Save As native project; Import supported project/package; Export project, printable logic sheets, and tag/I/O CSV; Project/Controller settings.
- **Edit:** Undo/Redo; Cut/Copy/Paste; duplicate rung/block; delete; find tag/instruction; renumber rungs; reorder network.
- **Draw:** LD contact (NO/NC), coil (normal/set/reset), branch, rung, connector; FBD function/block and typed connection. Palette entry click and drag call the same insertion path.
- **Tools:** Compile/type-check; run/stop/reset scan; single-step; force/release simulated input; watch list; cross-reference/tag usage; I/O map; scan trace; diagnostics. Simulation is explicitly isolated from physical hardware.
- **View:** LD/FBD program view; project tree; palette; tag/watch table; diagnostics; grid; online-value overlay; fit/zoom.

### Standards and engineering basis

- IEC 61131-3:2025 for LD/FBD/ST/SFC language syntax and semantics; the implemented language subset must be documented and parser/runtime-tested.
- DIN EN IEC 81346-1/-2 for project-configured references and object classification where applicable; DIN EN 61082-1 for printable electrotechnical document presentation.
- DIN EN 60204-1 (current applicable German edition) only for machine-electrical documentation profiles; it does not make a generic PLC editor machine-safety compliant.
- IEC 60617 symbols may appear in electrical schematics or I/O diagrams, but ladder language elements must not be mislabeled as IEC 60617 symbols.

### Acceptance evidence

Compilation rejects malformed networks, incompatible pin types, duplicate/invalid references, and unbound required I/O. LD/FBD insertion, edit/undo, serialization round-trip, deterministic scan results, and exports must be automated tests. Force/watch state is visibly simulated, never represented as live plant data.

## 2. VoltPro Simulator — analog and digital circuit simulation

### Layout

- **Top:** persistent navbar; document/analysis state; File/Edit/Draw/Tools/View; run/pause/stop/reset; analysis selector (operating point, transient, AC sweep only when supported by the solver).
- **Left:** searchable categorized component library with model availability, units, terminals, and provenance; selecting a part previews its pins and model support. Dragging and clicking create the same component model.
- **Center:** schematic canvas with an electrical grid, orthogonal wire routing, visible junction dots, pin/terminal connection feedback, reference tags, net labels, and ground/reference nodes. Optional waveform windows dock at the bottom/right and can be resized; instruments never float over selected nodes by default.
- **Right:** selected part parameters, pin model, tolerance, reference, and supported simulation model. Unsupported component models cannot be simulated; the UI identifies the unsupported operation instead of implying a result.
- **Bottom:** messages, net list, measurements, plot tabs, solver settings, and simulation progress. Trace colors identify channels and are paired with labels/legend.

### Commands

- **File:** New; Open/Save native project; Import supported netlist/project; Export schematic SVG/PDF and supported netlist; export analysis data CSV; page setup.
- **Edit:** Undo/Redo; Cut/Copy/Paste; Delete; rotate/mirror; find reference/net; assign references; select connected net.
- **Draw:** Select; place supported part; wire; junction; net label; ground/reference; text; probe/measurement marker.
- **Tools:** Check connectivity; show netlist; operating point; transient; AC sweep; component/model browser; instrument setup; plot cursor/measurements; solver diagnostics. Analysis menu lists only solver modes with verified implementations for current models.
- **View:** grid/snap; reference labels; net names; left/right/bottom panels; waveform panes; zoom/fit; schematic-only/measurement layout.

### Standards and engineering basis

- IEC 60617 sourced symbols for electrotechnical schematic diagrams, retaining exact catalog IDs and license/provenance; DIN EN 61082-1 for document presentation; DIN EN IEC 81346-1/-2 for configured reference designations.
- The virtual oscilloscope/meter is a simulation visualization, not a real instrument. DIN EN 61010-1 is a product-safety standard for actual measurement/control/laboratory equipment; its applicability to a software-only simulator must not be claimed as software certification.
- Solver correctness is established separately using published analytical test circuits, numerical convergence checks, and explicit model/analysis capability tables—not by claiming a display standard certifies the mathematics.

### Acceptance evidence

Each catalog part declares pin topology, parameters/units, symbol source, model support, and solver limitations. Connectivity survives save/load; all wires terminate on pins/junctions; netlist agrees with the graph; supported reference test circuits match expected results within stated tolerances; unsupported analyses return a clear diagnostic and no fabricated plot.

## 3. VoltPro ElectCAD — IEC electrical schematic and panel documentation

### Layout

- **Top:** persistent navbar; document number/revision; File/Edit/Draw/Tools/View and domain menus; sheet navigation; save/validation state.
- **Left:** project/sheet tree (power, control, terminal layout, panel layout) plus licensed IEC symbol/catalog library. Catalog cards display IEC 60617 identifier/title and applicable metadata; insert uses the licensed vector symbol and defined connection points.
- **Center:** page-frame drawing canvas with orthogonal conductors, grid, aligned symbols, connection points, junction/bridge distinction, wire numbers, cross-references, and sheet zones. Electrical connectivity is a graph separate from visual line segments.
- **Right:** properties for symbol, device designation, function/location/product aspects, manufacturer/part number, terminal mapping, conductor attributes, and connection list. Part-number metadata is explicit project data, never invented catalog content.
- **Bottom:** cross-reference table, terminal/cable report, BOM, diagnostics, and calculation panel. Calculation outputs are labeled by supported scope and assumptions.

### Commands

- **File:** New/Open/Save/Save As; import supported formats; export implemented SVG/PDF/DXF/IFC4/CSV; page setup; document/revision metadata. Export reports unsupported objects and coordinate/metadata loss before writing.
- **Edit:** Undo/Redo; Cut/Copy/Paste; delete; rotate/mirror; align/distribute; renumber sheet; find/replace designation; assign unique device/wire/terminal references.
- **Draw:** insert licensed IEC symbol; conductor; junction; terminal; potential/net label; text; page connector; dimension; panel footprint from verified manufacturer data.
- **Tools:** electrical rule checks; connectivity; wire numbering; cross-reference update; terminal/cable list; BOM; supported operating-point solver; library manager; import/export diagnostics. Each rule names profile, source/edition, scope, result, and severity.
- **View:** sheet zones/frame; cross-references; wire numbers; potentials; grid/snap; panel/schematic; terminal tables; zoom/fit.

### Standards and engineering basis

- DIN EN 61082-1 for document presentation; IEC 60617 official database for diagram symbols; DIN EN IEC 81346-1/-2 for reference designation/structuring; applicable IEC/DIN VDE product and installation rules are profile-dependent.
- For machine-control projects, apply DIN EN 60204-1 only after selecting the applicable current German edition and machine scope. The DIN Media catalog identifies DIN EN 60204-1:2026-06 as current on the review date; versioned project profiles must pin the edition.
- Manufacturer-specific enclosure, terminal, and component geometry is only selectable where data source, part number, revision, and dimensions are recorded.

### Acceptance evidence

The symbol browser has zero unlabeled/generic fallback graphics. Every symbol instance has catalog ID or is clearly a non-symbol annotation; every connection point is graph-backed; every conductor is orthogonal and electrically continuous; references are unique and stable; cross-references/BOM/terminal reports rebuild from the model; supported exports round-trip within declared format limits.

## 4. VoltPro Breadboard — physical prototyping and circuit lab

### Layout

- **Top:** persistent navbar; project name; File/Edit/Draw/Tools/View; run/pause/stop/reset; board profile and zoom.
- **Left:** physical component bin with real footprint/pinout data, model status, units, and source; parts include the actual board, verified microcontroller board, LEDs, resistors, capacitors, sources, and jumpers. Drag/drop lands pins on numbered holes/rails, not approximate component centers.
- **Center:** top-down breadboard at calibrated 2.54 mm pitch with labeled rows/rails and the selected board’s actual internal connectivity. Leads and jumpers snap to holes; wires are editable by endpoints and have consistent routing. Board can pan/zoom without changing coordinates.
- **Right:** selected part/lead properties and datasheet-grounded pinout; measurement panel shows simulated values only, with probe points, units, and solver status.
- **Bottom:** node/connectivity table, circuit diagnostics, serial/logic view where supported, and simulation controls.

### Commands

- **File:** New; Open/Save native project; import supported project; export project image/SVG and supported data; export connection list; print view.
- **Edit:** Undo/Redo; Cut/Copy/Paste; duplicate/delete part; rotate; move; delete jumper; clear board (confirm); find component.
- **Draw:** select/move; place physical component; place jumper; probe; rotate; measure. A lead only connects when it occupies a valid breadboard hole/pin.
- **Tools:** electrical continuity; net list; run/pause/reset solver; select board profile; component/model browser; measurement probes; supported scope/analyzer; diagnostics.
- **View:** pin/row labels; connectivity overlay; grid; top/bottom panels; fit/zoom; show/hide reference/value labels.

### Standards and engineering basis

- This is a physical prototyping representation, not an IEC 60617 schematic library. Use manufacturer/datasheet footprints, pin numbering, and electrical models with provenance. A linked schematic view, if provided, uses licensed IEC 60617 symbols and DIN EN 61082-1 presentation rules.
- Board geometry uses the board manufacturer’s hole pitch/topology; the current 2.54 mm pitch is a model parameter and must not be generalized to every board.
- IEC 61131-3 does not govern breadboard wiring; product/equipment safety standards apply to real hardware and are outside the virtual board’s certification scope.

### Acceptance evidence

Board holes and internal strips match the selected board profile; component pin maps match a cited source revision; jumper continuity equals the graph/netlist; invalid pin placements are rejected; saved projects restore exact placement and connections; measurements appear only for solver-supported models and include units/status.

## 5. VoltPro Electrical Building — architectural building wiring

### Layout

- **Top:** persistent navbar; project, building/floor, drawing number/revision; File/Edit/Draw/Tools/View; units, scale, profile, save/validation state.
- **Left:** building/floor/room/layer tree and searchable installation-object library. Separate architectural geometry (walls, openings, room boundaries) from electrical devices/circuits. Each object is a typed model item with data and behavior, not a text glyph standing in for a standard symbol.
- **Center:** measured 2D floor-plan view, statically gridded with metric major/minor intervals and top numeric/left alphabetic sheet zones. Grid scale is a display/reference aid; dimensions and actual coordinates define geometry. Device and conductor layers can be toggled independently. Cable routes use orthogonal segments, snap to the configured route grid, and expose bends/junctions/connections. Fixed title block prints project, sheet, date, scale, drafter, revision, and units.
- **Right:** selected room/device/circuit properties. Fields depend on object type. Distribution board/circuit fields include supply profile, protective-device selections, conductors, and design assumptions; switches/sockets/lights include location, mounting height, circuit and verified product data; data outlets use a separate low-voltage/communications system and cannot be electrically merged with mains circuits.
- **Bottom:** room/circuit/device schedules, validation findings, dimension/cable summaries, and plan status. A circuit-class overlay distinguishes systems by legend and text, not color alone.

### Commands

- **File:** New building project; Open/Save/Save As; import supported DXF/SVG/JSON with scale/unit check; export supported PDF/DXF/SVG/JSON; page setup; project profile, title block, units, revision.
- **Edit:** Undo/Redo; Cut/Copy/Paste; delete; align/distribute; duplicate room/device with safe new IDs; find device/circuit; edit room and object properties.
- **Draw:** room/wall/opening/dimension; distribution board; switch; socket outlet; luminaire; data outlet; junction/connection; conductor route; text/callout. Every electrical item uses a catalog symbol/identifier appropriate to its document view, and placement creates a typed device record.
- **Tools:** coordinate/dimension checks; assign references; route orthogonally; check unconnected endpoints; check circuit separation; room/device schedule; circuit schedule; title block; DIN VDE 0100 profile checks; export validation. Calculations such as voltage drop/protective measure checks are available only when the needed installation, cable, supply, and protective-device inputs are provided and a validated rule implementation exists.
- **View:** floor/layer/room visibility; grid/rulers/zones; dimensions; device IDs; circuit classes; title block; fit/zoom; print preview.

### Standards and engineering basis

- DIN VDE 0100 project profile selects exact applicable parts/editions for the installation and declared use case; DIN 18015-1:2020-05 for residential planning principles where the project is a residential building; IEC 60617 official source for diagram symbols; DIN EN 61082-1 for document presentation; DIN EN IEC 81346-1/-2 for project-configured references.
- Device selection and circuit design require the relevant product standards, supply conditions, installation method, protective measures, environmental data, and applicable national rules. UI defaults must not be presented as a compliant design.
- Rooms and floor-plan walls are architectural geometry; they are not electrical schematic symbols. A proper standard symbol is used in the appropriate plan/diagram view with a legend and exact symbol provenance.

### Acceptance evidence

The current text abbreviations (`DB`, `S`, `⊙`, `⊗`, `D`) are not acceptable as IEC symbol substitutes. Release requires a licensed catalog-backed symbol set and provenance, separate mains/data networks, orthogonal graph-backed routes, unique references, calibrated units/dimensions, validated title-block metadata, import/export scale tests, and an auditable profile-based checklist with pass/fail/not-assessed results. No export may be called “compliant” merely because it rendered successfully.

## Repository gap assessment (baseline reviewed)

The existing applications already have substantial interaction and model logic, but they do **not** yet satisfy the specification’s no-placeholder/compliance gate:

- Electrical Building currently renders abbreviated text glyphs for its five devices and lacks the complete building/floor-plan model and full File/Edit/Draw/Tools/View menu contract.
- ElectCAD has useful drawing, save, diagnostic, and export features, but generic fallback symbol shapes and incomplete symbol provenance prevent an IEC 60617 sign-off.
- PLC has an executable simulated scan and LD/FBD editing; the IEC 61131-3 language subset and reference/documentation checks still need explicit coverage.
- Simulator has broad controls and circuit functions; solver/model support must be surfaced per component/analysis, and symbol provenance must be enforced.
- Breadboard has functional board interaction and a 2.54 mm model; board profiles, physical component provenance, and end-to-end pin/connectivity verification must be strengthened before a no-placeholder assertion.

**Verification statement:** at this baseline, I cannot confirm that no placeholder or generic element remains. The source audit found concrete generic/abbreviated symbols, so such a statement would be false. The acceptance evidence above defines the checks required before each tool can receive that sign-off.

## Source references (checked 2026-10-24)

- DIN Media, [DIN EN 61082-1:2015-10](https://www.dinmedia.de/en/standard/din-en-61082-1/235350315) — presentation rules for electrotechnical documents.
- IEC, [IEC 60617 Database](https://webstore.iec.ch/en/publication/2723) and [IEC TC 3 guidance](https://tc3.iec.ch/standard-as-database/) — official source for graphical symbols for diagrams; subscription and end-user restrictions apply.
- DKE, [DIN VDE 0100 series overview](https://www.dke.de/vde-0100) — German low-voltage installation scope and structure.
- DIN Media, [DIN EN IEC 81346-1:2024-07](https://www.dinmedia.de/en/standard/din-en-iec-81346-1/371543012) and [DIN EN IEC 81346-2](https://www.dinmedia.de/en/standard/din-en-iec-81346-2/320735342) — structuring/reference designation and object classification.
- IEC, [IEC 61131-3:2025](https://webstore.iec.ch/en/publication/68533) — PLC language syntax and semantics.
- DIN Media, [DIN 18015-1:2020-05](https://www.dinmedia.de/en/standard/din-18015-1/320242977) — residential electrical installation planning principles.
- DIN Media, [DIN EN 60204-1:2026-06](https://www.dinmedia.de/en/standard/din-en-60204-1/400530593) — machine electrical equipment; apply only to projects in scope.
- DIN Media, [DIN EN 61010-1:2020-03](https://www.dinmedia.de/de/norm/din-en-61010-1/315118261) — safety requirements for real measurement/control/laboratory equipment.

## Six-capability implementation and gap register

This register addresses every requested capability separately for every tool. **Partial** means there is working code for a narrower check or workflow; it does not satisfy the requested full feature. **Gap** means this release does not implement it. No cell is a standards-conformity claim. DRC means design-rule checking.

### VoltPro PLC

| Capability | Implementation and remaining gap |
|---|---|
| DRC | **Partial.** The validator/runtime reject malformed tags and terminals, duplicate coil drivers, cycles, and modeled shorts; timer behavior is scan-tested. Missing end-of-rung rules and findings citing verified IEC 61131-3 clauses are not implemented. |
| Wire numbering | **Gap.** Tags are editable, but automatic `%I`/`%Q` address assignment and address-to-I/O-list cross-references are absent. |
| BOM | **Gap.** There is no controller/rack/module configuration model from which to derive a hardware BOM. |
| Multi-sheet | **Implemented (scoped).** Main, subroutine, and interrupt program blocks map one-to-one to drawing sheets. Cross-references reject missing targets, duplicate links, interrupt-call targets, self-calls, and recursion. Interrupt triggers are recorded as project metadata; the educational simulator still scans the complete project every 20 ms rather than scheduling isolated blocks. |
| History | **Partial.** Undo/redo records model snapshots for editing. A readable, persistent audit log of rung-level actions is absent. |
| Smart Wire | **Partial.** Typed terminals and scan checks reject invalid connections and shorts. A dedicated rule preventing series-connected coils and requiring an output/function block at every rung end is absent. |

### VoltPro Simulator

| Capability | Implementation and remaining gap |
|---|---|
| DRC | **Partial.** Circuit review, graph validation, and solvers report selected topology/model issues. Complete floating-node and direct-supply-short coverage, rated voltage/current evaluation, and rule findings tied to exact datasheet limits are not established for every catalog device. |
| Wire numbering | **Partial.** The net resolver forms deterministic nets and the wire utility can number wires. User-assigned net names, common-color highlighting by net identity, and stable label round-tripping are not integrated as a complete workflow. |
| BOM | **Complete within the scoped acceptance.** The grouped inventory remains available, and an instance-level export lists reference, description, project model parameters, and tolerance when explicitly supplied. Missing tolerance is labeled “Not specified”; the report does not invent manufacturer order codes or verified limits. |
| Multi-sheet | **Gap.** Hierarchical circuit blocks with typed ports and validated inter-sheet connectivity are not implemented. |
| History | **Complete within the scoped acceptance.** Canvas undo/redo and recovery remain available. Parameter edits are recorded in a persistent, human-readable, per-project device-local audit (up to 300 entries), can be exported as JSON, and are explicitly not uploaded to cloud storage. Other canvas actions are not part of this parameter-audit scope. |
| Smart Wire | **Complete within the scoped acceptance.** Terminal graph checks reject incompatible terminal domains and types. During a supported live simulation, solver-derived wire voltage and current direction are shown; ideal parallel-wire loops are labeled indeterminate rather than assigned fabricated currents. This does not certify physical wiring suitability. |

### VoltPro ElectCAD

| Capability | Implementation and remaining gap |
|---|---|
| DRC | **Partial.** Connectivity diagnostics and a symbol-provenance audit are available. Full DIN EN 61082-1/DIN EN 60617 conformity, terminal/gauge-to-breaker checks, and verified clause-specific citations are not implemented. |
| Wire numbering | **Partial.** Sequential wire numbering is available in the shared documentation utility. Function-prefix rules and mandatory off-page connector cross-references are not fully enforced by the editor. |
| BOM | **Partial.** Existing BOM tools count selected device types. Verified manufacturer part numbers, quantities, and route-derived wire lengths are not a complete ElectCAD manufacturing report. |
| Multi-sheet | **Partial.** The project model supports sheets and cross-sheet document structure. Mandatory paired off-page links and a complete Power/Control/Terminal Layout lifecycle are not enforced. |
| History | **Partial.** Model undo/redo is supported. A persistent, exportable audit trail for documentation control is absent. |
| Smart Wire | **Partial.** Orthogonal routes and explicit graph/junction connectivity are supported. DIN EN 60445 color assignment, automatic junction dots, and visual hop bridges are not all implemented and verified. |

### VoltPro Breadboard

| Capability | Implementation and remaining gap |
|---|---|
| DRC | **Partial.** Board pitch, hole identity, physical pin mapping, and several connectivity errors have automated tests. A complete placement-overlap, wrong-hole, and required-ground report is not available for every part. |
| Wire numbering | **Gap.** Wire IDs exist for model integrity, but the requested color-and-endpoint Wiring Checklist is absent. |
| BOM | **Partial.** Component inventory can be derived from a project. A replication-ready BOM with verified resistor values, LED colors, and measured jumper lengths is not complete. |
| Multi-sheet | **Gap.** Named independent breadboard pages such as Power Stage and Logic Stage are not implemented as a project feature. |
| History | **Partial.** Editing supports reversible state changes in applicable workflows. A durable action-by-action component-placement and wire-move audit log is absent. |
| Smart Wire | **Partial.** The breadboard net resolver models electrically shared rows, rails, and physical terminals. It does not yet enforce every requested power-rail/data-pin compatibility rule at every interaction boundary. |

### VoltPro Electrical Building

| Capability | Implementation and remaining gap |
|---|---|
| DRC | **Partial.** The new validator checks metric document structure, unique IDs/references, valid endpoints, and power/data separation. RCD selection, cable cross-section versus protective-device coordination, PE continuity, switched-lighting checks, DIN VDE 0100 profile evaluation, and verified part-specific citations are not implemented. |
| Wire numbering | **Partial.** A project-local reference assignment and device schedule exist. Circuit designations, cable-type tags, cable schedules, and distribution-board cross-references are absent. Generated `VP-nnn` IDs are explicitly not DIN EN IEC 81346 designations. |
| BOM | **Partial.** A device schedule exports type, room, circuit, system, voltage, and mounting height. Material quantities, cable metres derived from routes, protective-device schedules, and verified products are absent. |
| Multi-sheet | **Partial.** Room boundaries and room names are editable. Floor grouping, a navigable floor/room project tree, and independent drawing sheets are absent. |
| History | **Partial.** Local save/recovery and undo/redo exist for model edits. A visible, durable audit trail of drawing changes is absent. |
| Smart Wire | **Partial.** Connections are grid-snapped and orthogonal, and power/data joins are blocked. Routes are not constrained to wall geometry; route lengths, room minimum-device checks, and DB/circuit traceability are absent. |

**Overall verification:** The six capabilities have each been evaluated for all five tools above, but the requirements are **not fully implemented**. In particular, there is no verified clause-by-clause DIN/VDE compliance, no licensed IEC 60617 catalog integrated for every symbol, and no full release-level sign-off. The passing software tests below establish only the behaviors they exercise. Do not use these tools or reports as proof that a real installation or machine design is safe or compliant.
