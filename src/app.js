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

    let exactSolution = new Solution([]);
    let eulerSolution = new Solution([]);
    let rk2Solution = new Solution([]);
    let rk4Solution = new Solution([]);

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
    if (show_exact) show_exact.addEventListener('change', renderOutputTable);
    if (show_euler) show_euler.addEventListener('change', renderOutputTable);
    if (show_rk2) show_rk2.addEventListener('change', renderOutputTable);
    if (show_rk4) show_rk4.addEventListener('change', renderOutputTable);

    /**
     * Gather parameters from UI input elements (if you implement them in HTML)
     * @returns {object} params
     */
    function getEquationParams() {
        // Helper to safely parse inputs and fallback to defaults without treating 0 as falsy
        const getValue = (id, defaultValue) => {
            const el = document.getElementById(id);
            if (!el) return defaultValue;
            const parsed = parseFloat(el.value);
            return isNaN(parsed) ? defaultValue : parsed;
        };

        const x0 = getValue('x0-input', defaultParams.x0);
        const v0 = getValue('v0-input', defaultParams.v0);
        const m = getValue('m-input', defaultParams.m);
        const k = getValue('k-input', defaultParams.k);
        const b = getValue('b-input', defaultParams.b);
        const ts = getValue('ts-input', defaultParams.ts);
        const t_end = getValue('t_end-input', defaultParams.t_end);

        // Return a parameters object matching the ODESolver expectations
        return { x0, v0, m, k, b, ts, t_end };
    }

    /**
     * Gather display parameters from UI checkboxes
     * @returns {object} displayParams
     */
    function getDisplayParams() {
        const showExact = document.getElementById('show-exact').checked;
        const showEuler = document.getElementById('show-euler').checked;
        const showRK2 = document.getElementById('show-rk2').checked;
        const showRK4 = document.getElementById('show-rk4').checked;
        
        return { showExact, showEuler, showRK2, showRK4 };
    }

    /**
     * Executes the simulations and handles the output
     */
    function runSimulation() {
        const eqParams = getEquationParams();
        const dpParams = getDisplayParams();

        console.log("Running simulation...");

        // Check if solver is loaded globally
        if (!window.ODESolver) {
            console.error("ODESolver not found. Check if solver.js is loaded correctly.");
            return;
        }

        // 3. Call approximation solver methods
        exactSolution = window.ODESolver.solveExact(eqParams);
        eulerSolution = window.ODESolver.solveEuler(eqParams);
        rk2Solution = window.ODESolver.solveRK2(eqParams);
        rk4Solution = window.ODESolver.solveRK4(eqParams);

        // 4. Render the results
        renderOutputTable();
    }

    /**
     * Helper to render the simulation results using Plotly.js
     */
    function renderOutputTable() {
        let eqParams = getEquationParams();
        let dpParams = getDisplayParams();
        let data = [];

        if (dpParams.showExact) {
            // Create the individual data traces
            const traceExact = {
                x: exactSolution.getResults().map(p => p.t),
                y: exactSolution.getResults().map(p => p.x),
                mode: 'lines',
                name: 'Exact Solution',
                line: { color: '#2ca02c', width: 3 }
            };
            data.push(traceExact);
        }

        if (dpParams.showEuler) {
            const traceEuler = {
                x: eulerSolution.getResults().map(p => p.t),
                y: eulerSolution.getResults().map(p => p.x),
                mode: 'lines+markers',
                name: 'Forward Euler',
                marker: { size: 4 },
                line: { color: '#d62728', width: 1 }
            };
            data.push(traceEuler);
        }

        if (dpParams.showRK2) {
            const traceRK2 = {
                x: rk2Solution.getResults().map(p => p.t),
                y: rk2Solution.getResults().map(p => p.x),
                mode: 'lines+markers',
                name: 'RK2',
                marker: { size: 4 },
                line: { color: '#ff7f0e', width: 1 }
            };
            data.push(traceRK2);
        }

        if (dpParams.showRK4) {
            const traceRK4 = {
                x: rk4Solution.getResults().map(p => p.t),
                y: rk4Solution.getResults().map(p => p.x),
                mode: 'lines+markers',
                name: 'RK4',
                marker: { size: 4 },
                line: { color: '#1f77b4', width: 1 }
            };
            data.push(traceRK4);
        }
        
        // Find max absolute value in exact solution traces to dynamically set a good y-axis range
        const maxVal = Math.max(...exactSolution.getResults().map(p => Math.abs(p.x)));

        const layout = {
            xaxis: { title: 'Time (seconds)', gridcolor: '#eee', range: [0, eqParams.t_end] },
            yaxis: { title: 'Position x (meters)', gridcolor: '#eee', range: [-1.3 * maxVal, 1.3 * maxVal] },
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
