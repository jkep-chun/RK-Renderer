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
        x0: 1.0,    // Initial position (m)
        v0: 0.0,    // Initial velocity (m/s)
        m: 0.1,     // Mass (kg)
        k: 1.0,     // Spring constant (N/m)
        b: 0.1,     // Damping coefficient (N-s/m)
        ts: 0.10,   // Time step (s)
        t_end: 10.0 // Simulation duration (s)
    };

    // 2. Query DOM elements (Buttons, Inputs, Output containers)
    // Example: const runButton = document.getElementById('run-btn');
    const mainContainer = document.querySelector('main');
    const refreshButton = document.getElementById('refresh-btn'); // Refreshes simulation
    const input_x0 = document.getElementById('x0-input');
    const input_v0 = document.getElementById('v0-input');
    const input_m = document.getElementById('m-input');
    const input_k = document.getElementById('k-input');
    const input_b = document.getElementById('b-input');
    const input_ts = document.getElementById('ts-input');
    const input_t_end = document.getElementById('t_end-input');
    const show_exact = document.getElementById('show-exact');
    const show_euler = document.getElementById('show-euler');
    const show_rk2 = document.getElementById('show-rk2');
    const show_rk4 = document.getElementById('show-rk4');

    // 3. Attach event listeners to buttons and inputs
    if (refreshButton) refreshButton.addEventListener('click', runSimulation);
    if (show_exact) show_exact.addEventListener('change', runSimulation);
    if (show_euler) show_euler.addEventListener('change', runSimulation);
    if (show_rk2) show_rk2.addEventListener('change', runSimulation);
    if (show_rk4) show_rk4.addEventListener('change', runSimulation);

    /**
     * Gather parameters from UI input elements (if you implement them in HTML)
     * @returns {object} params
     */
    function getEquationParams() {
        // Use optional chaining and default values to avoid errors if elements are missing
        const x0 = parseFloat(document.getElementById('x0-input')?.value) || defaultParams.x0;
        const v0 = parseFloat(document.getElementById('v0-input')?.value) || defaultParams.v0;
        const m = parseFloat(document.getElementById('m-input')?.value) || defaultParams.m;
        const k = parseFloat(document.getElementById('k-input')?.value) || defaultParams.k;
        const b = parseFloat(document.getElementById('b-input')?.value) || defaultParams.b;
        const ts = parseFloat(document.getElementById('ts-input')?.value) || defaultParams.ts;
        const t_end = parseFloat(document.getElementById('t_end-input')?.value) || defaultParams.t_end;

        // Return a parameters object matching the ODESolver expectations
        return { x0, v0, m, k, b, ts, t_end };
    }

    /**
     * Gather display parameters from UI checkboxes
     * @returns {object} displayParams
     */
    function getDisplayParams() {
        const showExact = document.getElementById('show-exact')?.checked ?? true;
        const showEuler = document.getElementById('show-euler')?.checked ?? true;
        const showRK2 = document.getElementById('show-rk2')?.checked ?? true;
        const showRK4 = document.getElementById('show-rk4')?.checked ?? true;
        
        return { showExact, showEuler, showRK2, showRK4 };
    }

    /**
     * Executes the simulations and handles the output
     */
    function runSimulation() {
        const eqParams = getEquationParams();
        const dpParams = getDisplayParams();

        console.log("Running simulation with parameters:", eqParams);

        // Check if solver is loaded globally
        if (!window.ODESolver) {
            console.error("ODESolver not found. Check if solver.js is loaded correctly.");
            return;
        }

        // 3. Call approximation solver methods
        const eulerResults = window.ODESolver.solveEuler(eqParams);
        const rk2Results = window.ODESolver.solveRK2(eqParams);
        const rk4Results = window.ODESolver.solveRK4(eqParams);

        // 4. Generate the exact solution over a smooth timeline for comparison
        const exactResults = [];
        const dtExact = 0.01; // Small time step for smooth analytical plotting
        for (let t = 0; t <= eqParams.t_end; t += dtExact) {
            const [x, v] = window.ODESolver.calcState(t, eqParams);
            exactResults.push({ t, x, v });
        }

        // 5. Render the results
        renderOutputTable(eulerResults, rk2Results, rk4Results, exactResults, eqParams, dpParams);
    }

    /**
     * Helper to render the simulation results using Plotly.js
     */
    function renderOutputTable(euler, rk2, rk4, exact, eqParams, dpParams) {
        let data = [];

        if (dpParams.showExact) {
            // Create the individual data traces
            const traceExact = {
                x: exact.map(p => p.t),
                y: exact.map(p => p.x),
                mode: 'lines',
                name: 'Exact Solution',
                line: { color: '#2ca02c', width: 3 }
            };
            data.push(traceExact);
        }

        if (dpParams.showEuler) {
            const traceEuler = {
                x: euler.map(p => p.t),
                y: euler.map(p => p.x),
                mode: 'lines+markers',
                name: 'Forward Euler',
                marker: { size: 4 },
                line: { color: '#d62728', width: 1 }
            };
            data.push(traceEuler);
        }

        if (dpParams.showRK2) {
            const traceRK2 = {
                x: rk2.map(p => p.t),
                y: rk2.map(p => p.x),
                mode: 'lines+markers',
                name: 'RK2',
                marker: { size: 4 },
                line: { color: '#ff7f0e', width: 1 }
            };
            data.push(traceRK2);
        }

        if (dpParams.showRK4) {
            const traceRK4 = {
                x: rk4.map(p => p.t),
                y: rk4.map(p => p.x),
                mode: 'lines+markers',
                name: 'RK4',
                marker: { size: 4 },
                line: { color: '#1f77b4', width: 1 }
            };
            data.push(traceRK4);
        }

        const layout = {
            xaxis: { title: 'Time (seconds)', gridcolor: '#eee', range: [0, eqParams.t_end] },
            yaxis: { title: 'Position x (meters)', gridcolor: '#eee', range: [-1.5 * Math.abs(eqParams.x0), 1.5 * Math.abs(eqParams.x0)] },
            showlegend: false,
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
