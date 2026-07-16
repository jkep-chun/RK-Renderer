/**
 * app.js - UI Event coordinator & fetch API handler
 */

import { Solution } from './solution.js';
import { ChartManager } from './charts.js';

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
    let dp45Solution = new Solution([]);

    // 2. Query DOM elements
    const refreshButton = document.getElementById('refresh-btn');
    const show_exact = document.getElementById('show-exact');
    const show_euler = document.getElementById('show-euler');
    const show_rk2 = document.getElementById('show-rk2');
    const show_rk4 = document.getElementById('show-rk4');
    const show_dp45 = document.getElementById('show-dp45');

    // 3. Attach event listeners
    if (refreshButton) refreshButton.addEventListener('click', runSimulation);
    if (show_exact) show_exact.addEventListener('change', renderOutputTable);
    if (show_euler) show_euler.addEventListener('change', renderOutputTable);
    if (show_rk2) show_rk2.addEventListener('change', renderOutputTable);
    if (show_rk4) show_rk4.addEventListener('change', renderOutputTable);
    if (show_dp45) show_dp45.addEventListener('change', renderOutputTable);

    /**
     * Gather parameters from UI input elements
     * @returns {object} params
     */
    function getEquationParams() {
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
        const showDP45 = document.getElementById('show-dp45')?.checked ?? true;
        
        return { showExact, showEuler, showRK2, showRK4, showDP45 };
    }

    /**
     * Executes the simulations by fetching from the backend API
     */
    async function runSimulation() {
        const eqParams = getEquationParams();
        console.log("Fetching simulation results from backend API...");

        // Disable refresh button to indicate loading
        if (refreshButton) {
            refreshButton.disabled = true;
            refreshButton.textContent = "Loading...";
        }

        try {
            // Build query parameters
            const queryParams = new URLSearchParams(eqParams).toString();
            
            // Fetch from API (relative URL works when served from the same FastAPI server)
            const response = await fetch(`/api/solve?${queryParams}`);
            if (!response.ok) {
                throw new Error(`Server returned error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Populate Solution wrappers
            exactSolution = new Solution(data.exact);
            eulerSolution = new Solution(data.euler);
            rk2Solution = new Solution(data.rk2);
            rk4Solution = new Solution(data.rk4);
            dp45Solution = new Solution(data.dp45);

            // Render output dashboard
            renderOutputTable();

        } catch (error) {
            console.error("Failed to run simulation:", error);
            alert("Failed to communicate with Python Backend. Please ensure the backend is running at http://localhost:8000\n\nCommand to run:\nnpm start");
        } finally {
            if (refreshButton) {
                refreshButton.disabled = false;
                refreshButton.textContent = "Refresh";
            }
        }
    }

    /**
     * Helper to format numbers dynamically
     */
    function formatError(val) {
        if (val === 0) return '0.0000';
        if (Math.abs(val) < 1e-4) {
            return val.toExponential(4);
        }
        return val.toFixed(5);
    }

    /**
     * Updates the UI error table and triggers the ChartManager to render
     */
    function renderOutputTable() {
        const eqParams = getEquationParams();
        const dpParams = getDisplayParams();

        // Update error values in the UI
        const eulerRmsEl = document.getElementById('euler-rms');
        const eulerLinfEl = document.getElementById('euler-linf');
        const rk2RmsEl = document.getElementById('rk2-rms');
        const rk2LinfEl = document.getElementById('rk2-linf');
        const rk4RmsEl = document.getElementById('rk4-rms');
        const rk4LinfEl = document.getElementById('rk4-linf');
        const dp45RmsEl = document.getElementById('dp45-rms');
        const dp45LinfEl = document.getElementById('dp45-linf');

        if (eulerRmsEl && eulerLinfEl) {
            eulerRmsEl.textContent = formatError(eulerSolution.getRMSE());
            eulerLinfEl.textContent = formatError(eulerSolution.getLInfinity());
        }
        if (rk2RmsEl && rk2LinfEl) {
            rk2RmsEl.textContent = formatError(rk2Solution.getRMSE());
            rk2LinfEl.textContent = formatError(rk2Solution.getLInfinity());
        }
        if (rk4RmsEl && rk4LinfEl) {
            rk4RmsEl.textContent = formatError(rk4Solution.getRMSE());
            rk4LinfEl.textContent = formatError(rk4Solution.getLInfinity());
        }
        if (dp45RmsEl && dp45LinfEl) {
            dp45RmsEl.textContent = formatError(dp45Solution.getRMSE());
            dp45LinfEl.textContent = formatError(dp45Solution.getLInfinity());
        }

        // Toggle faded class based on visibility
        const eulerRow = document.getElementById('euler-row');
        const rk2Row = document.getElementById('rk2-row');
        const rk4Row = document.getElementById('rk4-row');
        const dp45Row = document.getElementById('dp45-row');

        if (eulerRow) {
            if (dpParams.showEuler) eulerRow.classList.remove('faded');
            else eulerRow.classList.add('faded');
        }
        if (rk2Row) {
            if (dpParams.showRK2) rk2Row.classList.remove('faded');
            else rk2Row.classList.add('faded');
        }
        if (rk4Row) {
            if (dpParams.showRK4) rk4Row.classList.remove('faded');
            else rk4Row.classList.add('faded');
        }
        if (dp45Row) {
            if (dpParams.showDP45) dp45Row.classList.remove('faded');
            else dp45Row.classList.add('faded');
        }

        // Render chart using ChartManager
        const solutions = {
            exactSolution,
            eulerSolution,
            rk2Solution,
            rk4Solution,
            dp45Solution
        };
        ChartManager.render('plot-container', solutions, eqParams, dpParams);
    }

    // Run once on load
    runSimulation();
});
