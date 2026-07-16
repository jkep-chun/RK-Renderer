/**
 * solver.js
 * 
 * This object literal implements numerical solvers of the Runge-Kutta family.
 * Notes: the output of the solvers include 'v' key for velocity, but is unused at present
 */

import { Solution } from './solution.js'

// Helper functions
function arrAdd(u, v) {
    if (u.length === v.length) {
        let sum = [];
        for (let i = 0; i < u.length; i++) {
            sum.push(u[i] + v[i]);
        }
        return sum;
    } else {
        throw new Error("Mismatched array dimensions");
    }
}
function arrDiff(u, v) {
    if (u.length === v.length) {
        let diff = [];
        for (let i = 0; i < u.length; i++) {
            diff.push(u[i] - v[i]);
        }
        return diff;
    } else {
        throw new Error("Mismatched array dimensions");
    }
}
function arrMult(u, b) {
    let result = [];
    for (let i = 0; i < u.length; i++) {
        result.push(b*u[i]);
    }
    return result;
}
function arrDotMat(M, x) {
    let sum = [0, 0];
    for (let i = 0; i < M.length; i++) {
        sum = arrAdd(sum, arrMult(M[i], x[i]));
    }
    return sum;
}

export const Solver = {
   
    /**
     * Exact Analytical Solver for Damped Harmonic Oscillator
     * @param {number} t - Target evaluation time
     * @param {object} params - Input configuration { x0, v0, m, k, b }
     * @returns {Array<number>} - Returns state array [position, velocity]
     */
    calcState(t, params) {
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
            let omega = Math.sqrt(4 * m * k - b * b) / (2 * m);
            let alpha = -b / (2 * m);
            let a1 = (v0 - alpha * x0) / omega;
            let a2 = x0;
            let x = Math.exp(alpha * t) * (a2 * Math.cos(omega * t) + a1 * Math.sin(omega * t));
            let v = Math.exp(alpha * t) * (a2 * (alpha * Math.cos(omega * t) - omega * Math.sin(omega * t)) + a1 * (alpha * Math.sin(omega * t) + omega * Math.cos(omega * t)));
            return [x, v];
        }
    },

    /**
     * Coupled State-Space Derivative Function f(t, x) for Damped Harmonic Oscillator
     * @param {number} t - Current time
     * @param {Array<number>} x - State array [position, velocity]
     * @param {object} params - Oscillator parameters
     * @returns {Array<number>} - Derivative array [dx_dt, dv_dt]
     */
    calcDerivatives(t, x, params) {
        // Destructure the 2-element state array and let x1 = x, x2 = v
        const [x1, x2] = x; 
        const { x0, v0, m, k, b, ts, t_end } = params;
        
        // State space formulation
        const dx1_dt = x2;
        const dx2_dt = (-k*x1 - b*x2) / m;

        return [dx1_dt, dx2_dt];
    },

    /**
     * Exact Analytical Solver
     * @param {object} params - Input configuration { x0, v0, m, k, b }
     * @returns {Array<object>} - Array of states [{ t, x, v }, ...]
     */
    solveExact(params) {
        const { x0, v0, m, k, b, ts, t_end } = params;
        const dt = Math.max(0.01, ts / 5); // Ensure a minimum dt for smoothness
        const steps = Math.floor(t_end/dt);
        
        let t = 0;
        let x = [x0, v0];
        let y_hat = 0;

        
        const results = [];
        results.push({ t: 0, x: x[0], v: x[1], e: y_hat });

        // Loop over the total simulation steps
        for (let i = 1; i <= steps; i++) {
            t += dt;
            x = Solver.calcState(t, { x0, v0, m, k, b });
            results.push({ t: t, x: x[0], v: x[1], e: y_hat });
        }

        return new Solution(results);
    },

    /**
     * Forward Euler Method
     * @param {object} params - Configuration { x0, v0, ts, t_end, m, k, b }
     * @returns {Array<object>} - Array of states [{ t, x, v }, ...]
     */
    solveEuler(params) {
        const { x0, v0, m, k, b, ts, t_end } = params;
        const steps = Math.floor(t_end/ts);
        
        let t = 0;
        let x = [x0, v0];
        let y_hat = 0;
        
        const results = [];
        results.push({ t: 0, x: x[0], v: x[1], e: y_hat });

        // Loop over the total simulation steps
        for (let i = 1; i <= steps; i++) {
            const dx_dt = Solver.calcDerivatives(t, x, { m, k, b });
            x[0] += ts * dx_dt[0];
            x[1] += ts * dx_dt[1];

            t += ts;
            y_hat = x[0] - Solver.calcState(t, { x0, v0, m, k, b })[0];
            results.push({ t: t, x: x[0], v: x[1], e: y_hat });
        }

        return new Solution(results);
    },
    
    /**
     * Runge-Kutta 2nd Order Method (RK2) 
     * @param {object} params  - Configuration { x0, v0, ts, t_end, m, k, b }
     * @returns {Array<object>} - Array of states [{ t, x, v }, ...]
     */
    solveRK2(params) {
        const { x0, v0, m, k, b, ts, t_end } = params;
        const steps = Math.floor(t_end/ts);
        
        let t = 0;
        let x = [x0, v0];
        let y_hat = 0;
        
        const results = [];
        results.push({ t: 0, x: x[0], v: x[1], e: y_hat });

        // Loop over the total simulation steps
        for (let i = 1; i <= steps; i++) {
            const dx_dt = Solver.calcDerivatives(t, x, { m, k, b });
            let k1 = dx_dt;
            let k2 = Solver.calcDerivatives(t + ts/2, [x[0] + ts/2 * k1[0], x[1] + ts/2 * k1[1]], { m, k, b });
            x[0] += ts * k2[0];
            x[1] += ts * k2[1];

            t += ts;
            y_hat = x[0] - Solver.calcState(t, { x0, v0, m, k, b })[0];
            results.push({ t: t, x: x[0], v: x[1], e: y_hat });
        }

        return new Solution(results);
    },
    
    /**
     * Runge-Kutta 4th Order Method (RK4) 
     * @param {object} params - Configuration { x0, v0, ts, t_end, m, k, b }
     * @returns {Array<object>} - Array of states [{ t, x, v }, ...]
     */
    solveRK4(params) {
        const { x0, v0, m, k, b, ts, t_end } = params;
        const steps = Math.floor(t_end/ts);
        
        let t = 0;
        let x = [x0, v0];
        let y_hat = 0;
        
        const results = [];
        results.push({ t: 0, x: x[0], v: x[1], e: y_hat });

        // Loop over the total simulation steps
        for (let i = 1; i <= steps; i++) {
            const dx_dt = Solver.calcDerivatives(t, x, { m, k, b });
            let k1 = dx_dt;
            let k2 = Solver.calcDerivatives(t + ts/2, [x[0] + ts/2 * k1[0], x[1] + ts/2 * k1[1]], { m, k, b });
            let k3 = Solver.calcDerivatives(t + ts/2, [x[0] + ts/2 * k2[0], x[1] + ts/2 * k2[1]], { m, k, b });
            let k4 = Solver.calcDerivatives(t + ts, [x[0] + ts * k3[0], x[1] + ts * k3[1]], { m, k, b });
            x[0] += ts/6 * (k1[0] + 2*k2[0] + 2*k3[0] + k4[0]);
            x[1] += ts/6 * (k1[1] + 2*k2[1] + 2*k3[1] + k4[1]);

            t += ts;
            y_hat = x[0] - Solver.calcState(t, { x0, v0, m, k, b })[0];
            results.push({ t: t, x: x[0], v: x[1], e: y_hat });
        }

        return new Solution(results);
    },

    solveDP45(params) {

        const { x0, v0, m, k, b, ts, t_end } = params;

        const sf = 0.9; // Safety factor
        const tol = 1e-4; // Tolerance for error control

        let t = 0;
        let x = [x0, v0];
        let y_hat = 0;
        let dt = ts;

        const results = [];
        results.push({ t: 0, x: x[0], v: x[1], e: y_hat });

        const tableu = {
            a: [
                [],
                [1/5],
                [3/40, 9/40],
                [44/45, -56/15, 32/9],
                [19372/6561, -25360/2187, 64448/6561, -212/729],
                [9017/3168, -355/33, 46732/5247, 49/176, -5103/18656],
                [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84]
            ],
            b: [35/384, 0, 500/1113, 125/192, -2187/6784, 11/84, 0],
            b_hat: [5179/57600, 0, 7571/16695, 393/640, -92097/339200, 187/2100, 1/40],
            c: [0, 1/5, 3/10, 4/5, 8/9, 1, 1]
        };

        while (t < t_end) {
            dt = Math.min(dt, t_end - t);

            let ks = [];

            for (let i = 0; i < tableu.c.length; i++) {
                let Deltax = [0, 0];

                if (i === 0) {
                    ks.push(Solver.calcDerivatives(t, x, params));
                } else {
                    for (let j = 0; j < i; j++) {
                        Deltax = arrAdd(arrMult(ks[j], tableu.a[i][j]*dt), Deltax);
                    }
                    ks.push(Solver.calcDerivatives(t + tableu.c[i]*dt, arrAdd(x, Deltax), params));
                }
            }

            let dx = arrDotMat(ks, arrMult(tableu.b, dt));
            let dx_hat = arrDotMat(ks, arrMult(tableu.b_hat, dt));

            let error = Math.hypot(...arrDiff(dx, dx_hat));

            if (error <= tol) {
                x = arrAdd(x, dx);
                t += dt;
                y_hat = x[0] - Solver.calcState(t, { x0, v0, m, k, b })[0];
                results.push({ t: t, x: x[0], v: x[1], e: y_hat });
            }
            dt *= sf*Math.pow(tol/error, 1/5);
        }

        return new Solution(results);
    }

}
