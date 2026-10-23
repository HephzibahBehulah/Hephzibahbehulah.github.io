# Simulation subsystem

## Current implementation
The frontend includes a deterministic DC operating-point solver using modified nodal analysis (MNA). It stamps ideal DC voltage sources and linear resistors into a conductance matrix, solves with pivoted Gaussian elimination, and reports modeled component voltage drops, currents and power. The solver refuses missing explicit ground references, invalid resistance values, singular systems and inputs exceeding 5,000 components or 10,000 wire segments. It does not fabricate waveform data.

## Supported models
- Ideal independent DC voltage source (power, battery).
- Linear resistor and parametric resistor-family variants.
- Explicit ground/reference.
- Simple contacts where the component value explicitly indicates closed/on; normally-closed push buttons/contacts default closed in this initial model.
- Other symbols are excluded and returned as warnings.

## Not yet supported
No validated nonlinear diode/BJT/MOSFET models, capacitor/inductor transient integration, AC small-signal analysis, waveform viewer, temperature effects, convergence controls for nonlinear devices, ngspice adapter, or verified manufacturer model importer. This is not a SPICE replacement.

## Run
npm test runs solver reference-circuit tests. npm run test:solver runs only the DC solver tests. The solver is also available through the Simulation menu in the web app.

## Numerical scope and safety
The current solver is intended for learning and preliminary exploration. It has no safety, installation, machine, protection coordination or standards certification. Singular matrices can indicate missing connections, floating nodes, invalid ideal-source loops, or other topology issues. Inspect the circuit and warnings before interpreting values.
