# Simulation Model Guide

VoltPRo's simulation contract is:

Schematic → topology/netlist → component models → MNA solve → results → visualisation.

## Current engine

The browser-native MNA engine implements:

- DC operating point.
- AC frequency sweep.
- Backward-Euler transient analysis for capacitors and inductors.
- DC/AC source stamping and dependent sources.
- Piecewise-linear diode/Zener/LED behaviour.
- Simplified BJT and MOSFET/IGBT behavioural envelopes.
- Branch voltage, current and power reporting.

This is an MNA implementation, not Ngspice.

## Model requirements

A new model must document its equations/behaviour, units, pin order, supported analyses, parameter limits and regression tests. Safety-critical engineering claims require independent verification against manufacturer data and applicable standards.
