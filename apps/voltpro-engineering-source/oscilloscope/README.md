# VoltPro Oscilloscope

Open `/oscilloscope` in the deployed engineering suite. For local development, serve the engineering source directory with a static server that sends `.mjs` as `text/javascript`, then open `oscilloscope.html`. No bundling or external instrument library is required. Run `node --test tests/oscilloscope.test.mjs` from the engineering source directory.

Simulation is the default and is explicitly labelled. CH1: 50 Hz sine / 4 Vpp; CH2: 50 Hz square / 2 Vpp / 50% duty. The display is 10 × 8 divisions, 1 V/div per channel, 5 ms/div, 100 kSa/s and 5,000 samples. Sampling is independent of display drawing. Quantization uses a zero-preserving symmetric signed code grid at selectable 8/12/16 bits, ±10 V range. There is no analog bandwidth or anti-alias filter; ideal edges and undersampling are warned. AC uses a first-order 10 Hz high-pass with 150 ms warmup. GND is zero.

Normal waits without replacing the previous record. Auto forces an untriggered record after 500 ms. Single waits for an edge, captures once and stops. Display scaling never modifies captured values. The trace renderer aggregates sample min/max per pixel and supports sample-point display. Measurements use the complete captured record, midpoint thresholds for period/duty/pulse width, and 10–90% thresholds for rise/fall (at least three transition samples). Insufficient cycles or samples produce Unavailable with a reason.

CSV: `time_s,CH1_V,CH2_V`, seconds and volts, increasing uniform timestamps within 0.1%, 3–100,000 samples. `#` comment lines contain exported metadata. CSV imports are frozen captures. PNG, exact sample CSV and instrument settings JSON export are available. Settings include display/cursor preferences.

No hardware is connected. `adapters.mjs` defines registration, connection, acquisition and disconnection contracts. A future adapter must report actual sample rate, record length and bandwidth and return timestamped two-channel records. The hardware selector remains disabled until a supported device integration is delivered. FFT, XY and persistence are future extensions, not enabled controls.
