# VoltPRo Platform Integration
## Status
This release wires the platform modules into the simulator without claiming unfinished features are production-complete.

## Runtime modules
- MNA engine: analysis core.
- Project format: versioned .voltpro data.
- Panel: DIN-rail placement and overlap validation.
- Faults: controlled fault scenarios and diagnosis.
- Challenges: topology-aware validation.
- Tutorials: deterministic step sessions.
- MCU: safe static Arduino statement modeling; not native compilation.
- BOM: project component aggregation and CSV export.
- Engineering: educational calculations.
- i18n: locale loading with English fallback.
- Plugins: JSON plugin registration contract.

## Safety boundary
VoltPRo is an educational simulator. It does not certify electrical designs, protective-device settings, installations, or safety compliance.