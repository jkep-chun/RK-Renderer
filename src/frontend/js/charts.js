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
     */
    render(containerId, solutions, eqParams, dpParams) {
        const { exactSolution, eulerSolution, rk2Solution, rk4Solution, dp45Solution } = solutions;
        const data = [];

        if (dpParams.showExact && exactSolution) {
            data.push({
                x: exactSolution.getResults().map(p => p.t),
                y: exactSolution.getResults().map(p => p.x),
                mode: 'lines',
                name: 'Exact Solution',
                line: { color: '#2ca02c', width: 1 }
            });
        }

        if (dpParams.showEuler && eulerSolution) {
            data.push({
                x: eulerSolution.getResults().map(p => p.t),
                y: eulerSolution.getResults().map(p => p.x),
                mode: 'lines+markers',
                name: 'Forward Euler',
                marker: { size: 4 },
                line: { color: '#d62728', width: 1 }
            });
        }

        if (dpParams.showRK2 && rk2Solution) {
            data.push({
                x: rk2Solution.getResults().map(p => p.t),
                y: rk2Solution.getResults().map(p => p.x),
                mode: 'lines+markers',
                name: 'RK2',
                marker: { size: 4 },
                line: { color: '#ff7f0e', width: 1 }
            });
        }

        if (dpParams.showRK4 && rk4Solution) {
            data.push({
                x: rk4Solution.getResults().map(p => p.t),
                y: rk4Solution.getResults().map(p => p.x),
                mode: 'lines+markers',
                name: 'RK4',
                marker: { size: 4 },
                line: { color: '#1f77b4', width: 1 }
            });
        }

        if (dpParams.showDP45 && dp45Solution && dp45Solution.getResults().length > 0) {
            data.push({
                x: dp45Solution.getResults().map(p => p.t),
                y: dp45Solution.getResults().map(p => p.x),
                mode: 'lines+markers',
                name: 'DP45',
                marker: { size: 4 },
                line: { color: '#9467bd', width: 1 }
            });
        }

        // Find max absolute value in exact solution traces to dynamically set a good y-axis range
        const exactResults = exactSolution ? exactSolution.getResults() : [];
        const maxVal = exactResults.length > 0 ? Math.max(...exactResults.map(p => Math.abs(p.x))) : 1.0;

        const layout = {
            xaxis: { title: 'Time (seconds)', gridcolor: '#eee', range: [0, eqParams.t_end] },
            yaxis: { title: 'Position x (meters)', gridcolor: '#eee', range: [-1.3 * maxVal, 1.3 * maxVal] },
            showlegend: false,
            plot_bgcolor: '#fafafa',
            paper_bgcolor: '#ffffff',
            margin: { t: 50, b: 50, l: 60, r: 20 }
        };

        Plotly.newPlot(containerId, data, layout);
    }
};
