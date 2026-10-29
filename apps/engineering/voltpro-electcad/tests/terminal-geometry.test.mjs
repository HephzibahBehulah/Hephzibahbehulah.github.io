import test from 'node:test';
import assert from 'node:assert/strict';
import { terminalCount, connectablePins, terminalLabel } from '../src/terminal-geometry.mjs';

test('schematic parts expose their expected electrical terminals', () => {
  for (const type of ['resistor', 'capacitor', 'diode', 'led', 'inductor', 'lamp', 'power']) {
    assert.equal(terminalCount(type), 2, `${type} has two connection terminals`);
  }
  for (const type of ['npn-transistor', 'pnp-transistor', 'nmos', 'logic-gate-and']) {
    assert.equal(terminalCount(type), 3, `${type} has three signal terminals`);
  }
  assert.equal(terminalCount('ground'), 1);
  assert.equal(terminalCount('op-amp'), 5, 'op amp includes two inputs, output, and two supply pins');
  assert.equal(terminalCount('microcontroller'), 28, 'ATmega328P-PU DIP package exposes all 28 physical pins');
  assert.equal(terminalCount('terminal-block'), 8);
});

test('DIP-28 pin geometry and labels match the rendered package footprint', () => {
  const pins = connectablePins({ id: 'u1', type: 'microcontroller', x: 100, y: 200 });
  assert.equal(pins.length, 28);
  assert.deepEqual(pins[0], { x: 58, y: 135 });
  assert.deepEqual(pins[13], { x: 58, y: 265 });
  assert.deepEqual(pins[14], { x: 142, y: 265 });
  assert.deepEqual(pins[27], { x: 142, y: 135 });
  assert.equal(terminalLabel('microcontroller', 0), '1');
  assert.equal(terminalLabel('microcontroller', 27), '28');
  assert.ok(pins.every(pin => Number.isFinite(pin.x) && Number.isFinite(pin.y)));
});

test('polarized passive and switching parts expose their third terminal', () => {
  assert.equal(terminalCount('potentiometer'), 3);
  assert.equal(terminalCount('changeover-contact'), 3);
  assert.equal(terminalCount('selector-switch'), 3);
  assert.equal(terminalCount('selector-3-position'), 4);
});
