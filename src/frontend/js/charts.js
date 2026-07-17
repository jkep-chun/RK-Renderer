/**
 * charts.js - Chart Initialization and Render Manager using Plotly.js
 */

export const ChartManager = {
    /**
     * Renders the ODE solution traces in the specified DOM element.
     * @param {string} containerId - The ID of the container element
     * @param {object} solutions - Object containing Solution instances
     * @param {object} eqParams - Physics parameters
     * @param {object} dpParams - Display visibility parameters
     * @param {number} animationTime - Current time of the animation playback (seconds)
     */
    render(containerId, solutions, eqParams, dpParams, animationTime = eqParams.t_end) {
        const { exactSolution, eulerSolution, rk2Solution, rk4Solution, dp45Solution } = solutions;
        const data = [];

        if (dpParams.showExact && exactSolution) {
            const results = exactSolution.getResults().filter(p => p.t <= animationTime);
            data.push({
                x: results.map(p => p.t),
                y: results.map(p => p.x),
                mode: 'lines',
                name: 'Exact Solution',
                line: { color: '#2ca02c', width: 1 }
            });
        }

        if (dpParams.showEuler && eulerSolution) {
            const results = eulerSolution.getResults().filter(p => p.t <= animationTime);
            data.push({
                x: results.map(p => p.t),
                y: results.map(p => p.x),
                mode: 'lines+markers',
                name: 'Forward Euler',
                marker: { size: 4 },
                line: { color: '#d62728', width: 1 }
            });
        }

        if (dpParams.showRK2 && rk2Solution) {
            const results = rk2Solution.getResults().filter(p => p.t <= animationTime);
            data.push({
                x: results.map(p => p.t),
                y: results.map(p => p.x),
                mode: 'lines+markers',
                name: 'RK2',
                marker: { size: 4 },
                line: { color: '#ff7f0e', width: 1 }
            });
        }

        if (dpParams.showRK4 && rk4Solution) {
            const results = rk4Solution.getResults().filter(p => p.t <= animationTime);
            data.push({
                x: results.map(p => p.t),
                y: results.map(p => p.x),
                mode: 'lines+markers',
                name: 'RK4',
                marker: { size: 4 },
                line: { color: '#1f77b4', width: 1 }
            });
        }

        if (dpParams.showDP45 && dp45Solution) {
            const results = dp45Solution.getResults().filter(p => p.t <= animationTime);
            if (results.length > 0) {
                data.push({
                    x: results.map(p => p.t),
                    y: results.map(p => p.x),
                    mode: 'lines+markers',
                    name: 'DP45',
                    marker: { size: 4 },
                    line: { color: '#9467bd', width: 1 }
                });
            }
        }

        // Find max absolute value in exact solution traces to dynamically set a good y-axis range
        const exactResults = exactSolution ? exactSolution.getResults() : [];
        const maxVal = exactResults.length > 0 ? Math.max(...exactResults.map(p => Math.abs(p.x))) : 1.0;

        // Vertical cursor tracking the horizontal playback progress
        const shapes = [];
        if (animationTime !== undefined && animationTime <= eqParams.t_end) {
            shapes.push({
                type: 'line',
                xref: 'x',
                yref: 'y',
                x0: animationTime,
                y0: -1.3 * maxVal,
                x1: animationTime,
                y1: 1.3 * maxVal,
                line: {
                    color: 'rgba(71, 85, 105, 0.7)', // Slate-600
                    width: 2,
                    dash: 'dash'
                }
            });
        }

        const layout = {
            xaxis: { title: 'Time (seconds)', gridcolor: '#eee', range: [0, eqParams.t_end] },
            yaxis: { title: 'Position x (meters)', gridcolor: '#eee', range: [-1.3 * maxVal, 1.3 * maxVal] },
            showlegend: false,
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#ffffff',
            margin: { t: 50, b: 50, l: 60, r: 20 },
            shapes: shapes
        };

        Plotly.newPlot(containerId, data, layout);
    }
};
