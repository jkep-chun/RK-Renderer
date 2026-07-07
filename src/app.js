/**
 * app.js - Application Setup and UI Handler Stub
 * 
 * Syntax Guideline:
 * - Listen for DOMContentLoaded to ensure elements are loaded before querying.
 * - Retrieve user inputs, convert them to numbers, and run solvers.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // 1. Define default simulation parameters
    const defaultParams = {
        x0: 0.5,    // Initial position (m)
        v0: 1.0,    // Initial velocity (m/s)
        m: 0.1,     // Mass (kg)
        k: 3.2,     // Spring constant (N/m)
        b: 0.05,    // Damping coefficient (N-s/m)
        ts: 0.25,   // Time step (s)
        t_end: 10.0 // Simulation duration (s)
    };

    // 2. Query DOM elements (Buttons, Inputs, Output containers)
    // Example: const runButton = document.getElementById('run-btn');
    const mainContainer = document.querySelector('main');
    const refreshButton = document.getElementById('refresh-btn'); // Refreshes simulation
    const input_x0 = document.getElementById('x0-input');
    const input_v0 = document.getElementById('v0-input');
    const input_m = document.getElementById('mass-input');
    const input_k = document.getElementById('k-input');
    const input_b = document.getElementById('b-input');
    const input_ts = document.getElementById('ts-input');
    const input_tend = document.getElementById('tend-input');

    // 3. Attach event listeners to buttons and inputs
    if (input_x0) input_x0.addEventListener('input', runSimulation);
    if (input_v0) input_v0.addEventListener('input', runSimulation);
    if (input_m) input_m.addEventListener('input', runSimulation);
    if (input_k) input_k.addEventListener('input', runSimulation);
    if (input_b) input_b.addEventListener('input', runSimulation);
    if (input_ts) input_ts.addEventListener('input', runSimulation);
    if (input_tend) input_tend.addEventListener('input', runSimulation);
    if (refreshButton) refreshButton.addEventListener('click', runSimulation);

    /**
     * Gather parameters from UI input elements (if you implement them in HTML)
     * @returns {object} params
     */
    function getUIParams() {
        // Use optional chaining and default values to avoid errors if elements are missing
        const x0 = parseFloat(document.getElementById('x0-input')?.value) || defaultParams.x0;
        const v0 = parseFloat(document.getElementById('v0-input')?.value) || defaultParams.v0;
        const m = parseFloat(document.getElementById('mass-input')?.value) || defaultParams.m;
        const k = parseFloat(document.getElementById('k-input')?.value) || defaultParams.k;
        const b = parseFloat(document.getElementById('b-input')?.value) || defaultParams.b;
        const ts = parseFloat(document.getElementById('ts-input')?.value) || defaultParams.ts;
        const t_end = parseFloat(document.getElementById('tend-input')?.value) || defaultParams.t_end;

        // Return a parameters object matching the ODESolver expectations
        return { x0, v0, m, k, b, ts, t_end };
    }

    /**
     * Executes the simulations and handles the output
     */
    function runSimulation() {
        const params = getUIParams();

        console.log("Running simulation with parameters:", params);

        // Check if solver is loaded globally
        if (!window.ODESolver) {
            console.error("ODESolver not found. Check if solver.js is loaded correctly.");
            return;
        }

        // 3. Call approximation solver methods
        const eulerResults = window.ODESolver.solveEuler(params);
        const rk2Results = window.ODESolver.solveRK2(params);
        const rk4Results = window.ODESolver.solveRK4(params);

        // 4. Generate the exact solution over a smooth timeline for comparison
        const exactResults = [];
        const dtExact = 0.01; // Small time step for smooth analytical plotting
        for (let t = 0; t <= params.t_end; t += dtExact) {
            const [x, v] = window.ODESolver.calcState(t, params);
            exactResults.push({ t, x, v });
        }

        // 5. Render the results
        renderOutputTable(eulerResults, rk2Results, rk4Results, exactResults, params);
    }

    /**
     * Helper to render the simulation results using Plotly.js
     */
    function renderOutputTable(euler, rk2, rk4, exact, params) {
        // Create the individual data traces
        const traceExact = {
            x: exact.map(p => p.t),
            y: exact.map(p => p.x),
            mode: 'lines',
            name: 'Exact (Analytical)',
            line: { color: '#2ca02c', width: 2 }
        };

        const traceEuler = {
            x: euler.map(p => p.t),
            y: euler.map(p => p.x),
            mode: 'lines+markers',
            name: 'Forward Euler',
            marker: { size: 6 },
            line: { color: '#d62728', dash: 'dash' }
        };

        const traceRK2 = {
            x: rk2.map(p => p.t),
            y: rk2.map(p => p.x),
            mode: 'lines+markers',
            name: 'RK2 (Midpoint)',
            marker: { size: 6 },
            line: { color: '#ff7f0e', dash: 'dot' }
        };

        const traceRK4 = {
            x: rk4.map(p => p.t),
            y: rk4.map(p => p.x),
            mode: 'lines+markers',
            name: 'RK4',
            marker: { size: 6 },
            line: { color: '#1f77b4' }
        };

        const data = [traceExact, traceEuler, traceRK2, traceRK4];

        const layout = {
            title: {
                text: 'Damped Harmonic Oscillator: Numerical Stability Comparison',
                font: { family: 'Arial, sans-serif', size: 16 }
            },
            xaxis: { title: 'Time (seconds)', gridcolor: '#eee' },
            yaxis: { title: 'Position x (meters)', gridcolor: '#eee' },
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#ffffff',
            margin: { t: 50, b: 50, l: 60, r: 20 }
        };

        // Render the plot in the DOM element with ID 'plot-container'
        Plotly.newPlot('plot-container', data, layout);
    }

    // Run once on load with default parameters
    runSimulation();
});
