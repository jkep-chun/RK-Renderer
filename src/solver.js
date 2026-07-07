(function (global) {
    'use strict';

    // Plain object to hold solver methods has less overhead than a class
    const ODESolver = {};

    /**
     * Exact Analytical Solver
     * @param {number} t - Target evaluation time
     * @param {object} params - Input configuration { x0, v0, m, k, b }
     * @returns {Array<number>} - Returns state array [position, velocity]
     */
    ODESolver.calcState = function (t, params) {
        const { x0, v0, m, k, b, ts, t_end } = params;

        let discriminant = b*b - 4*m*k;
        
        if (discriminant > 0) {
            // Overdamped case
            let r1 = (-b + Math.sqrt(discriminant)) / (2*m);
            let r2 = (-b - Math.sqrt(discriminant)) / (2*m);
            let a1 = (r2*x0 - v0) / (r2 - r1);
            let a2 = x0 - a1;
            let x = a1*Math.exp(r1*t) + a2*Math.exp(r2*t);
            let v = a1*r1*Math.exp(r1*t) + a2*r2*Math.exp(r2*t);
            return [x, v]; 
        } else if (discriminant === 0) {
            // Critically damped case
            let r = -b / (2*m);
            let a1 = x0;
            let a2 = v0 - a1*r;
            let x = (a1 + a2*t) * Math.exp(r*t);
            let v = (a1 + a2*t) * r*Math.exp(r*t) + a2*Math.exp(r*t);
            return [x, v];
        } else {
            // Underdamped case
            // TODO: Check if the formula for omega and alpha is correct for underdamped case
            let omega = Math.sqrt(4 * m * k - b * b) / (2 * m);
            let alpha = -b / (2 * m);
            let a1 = (v0 - alpha * x0) / omega;
            let a2 = x0;
            let x = Math.exp(alpha * t) * (a2 * Math.cos(omega * t) + a1 * Math.sin(omega * t));
            let v = Math.exp(alpha * t) * (a2 * (alpha * Math.cos(omega * t) - omega * Math.sin(omega * t)) + a1 * (alpha * Math.sin(omega * t) + omega * Math.cos(omega * t)));
            return [x, v];
        }
    };

    /**
     * Coupled State-Space Derivative Function f(t, y)
     * @param {number} t - Current time
     * @param {Array<number>} y - State array [position, velocity]
     * @param {object} params - Oscillator parameters
     * @returns {Array<number>} - Derivative array [dx_dt, dv_dt]
     */
    ODESolver.calcDerivatives = function (t, y, params) {
        const [x, v] = y; // Destructure the 2-element state array
        const { x0, v0, m, k, b, ts, t_end } = params;
        
        // State space formulation
        const dx_dt = v;
        const dv_dt = (-k*x - b*v) / m;

        return [dx_dt, dv_dt];
    }

    /**
     * Forward Euler Method
     * @param {object} params - Configuration { x0, v0, ts, t_end, m, k, b }
     * @returns {Array<object>} - Array of states [{ t, x, v }, ...]
     */
    ODESolver.solveEuler = function (params) {
        const { x0, v0, m, k, b, ts, t_end } = params;
        const steps = Math.floor(t_end/ts);
        
        let t = 0;
        let y = [x0, v0];
        
        const results = [];
        results.push({ t: 0, x: y[0], v: y[1] });

        // Loop over the total simulation steps
        for (let i = 1; i < steps; i++) {
            const dy_dt = ODESolver.calcDerivatives(t, y, { m, k, b });
            y[0] += ts * dy_dt[0];
            y[1] += ts * dy_dt[1];

            t += ts;
            results.push({ t: t, x: y[0], v: y[1] });
        }

        return results;
    };
    
    /**
     * Runge-Kutta 2nd Order Method (RK2) 
     * @param {object} params  - Configuration { x0, v0, ts, t_end, m, k, b }
     * @returns {Array<object>} - Array of states [{ t, x, v }, ...]
     */
    ODESolver.solveRK2 = function (params) {
        const { x0, v0, m, k, b, ts, t_end } = params;
        const steps = Math.floor(t_end/ts);
        
        let t = 0;
        let y = [x0, v0];
        
        const results = [];
        results.push({ t: 0, x: y[0], v: y[1] });

        // Loop over the total simulation steps
        for (let i = 1; i < steps; i++) {
            const dy_dt = ODESolver.calcDerivatives(t, y, { m, k, b });
            let k1 = dy_dt;
            let k2 = ODESolver.calcDerivatives(t + ts/2, [y[0] + ts/2 * k1[0], y[1] + ts/2 * k1[1]], { m, k, b });
            y[0] += ts * k2[0];
            y[1] += ts * k2[1];

            t += ts;
            results.push({ t: t, x: y[0], v: y[1] });
        }

        return results;
    };
    
    /**
     * Runge-Kutta 4th Order Method (RK4) 
     * @param {object} params - Configuration { x0, v0, ts, t_end, m, k, b }
     * @returns {Array<object>} - Array of states [{ t, x, v }, ...]
     */
    ODESolver.solveRK4 = function (params) {
        const { x0, v0, m, k, b, ts, t_end } = params;
        const steps = Math.floor(t_end/ts);
        
        let t = 0;
        let y = [x0, v0];
        
        const results = [];
        results.push({ t: 0, x: y[0], v: y[1] });

        // Loop over the total simulation steps
        for (let i = 1; i < steps; i++) {
            const dy_dt = ODESolver.calcDerivatives(t, y, { m, k, b });
            let k1 = dy_dt;
            let k2 = ODESolver.calcDerivatives(t + ts/2, [y[0] + ts/2 * k1[0], y[1] + ts/2 * k1[1]], { m, k, b });
            let k3 = ODESolver.calcDerivatives(t + ts/2, [y[0] + ts/2 * k2[0], y[1] + ts/2 * k2[1]], { m, k, b });
            let k4 = ODESolver.calcDerivatives(t + ts, [y[0] + ts * k3[0], y[1] + ts * k3[1]], { m, k, b });
            y[0] += ts/6 * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]);
            y[1] += ts/6 * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]);

            t += ts;
            results.push({ t: t, x: y[0], v: y[1] });
        }

        return results;
    };

    // Expose the ODESolver namespace globally for use in app.js
    global.ODESolver = ODESolver;

})(typeof window !== 'undefined' ? window : global);
