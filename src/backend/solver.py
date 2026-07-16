import numpy as np
from numba import njit
from .physics import calc_exact_state, calc_derivatives

@njit
def solve_exact(x0, v0, m, k, b, ts, t_end):
    """
    Exact Analytical Solution sampled at fine grid for smooth display.
    """
    dt = max(0.01, ts / 5.0)
    steps = int(np.floor(t_end / dt))
    
    results = np.zeros((steps + 1, 4))
    results[0, 0] = 0.0
    results[0, 1] = x0
    results[0, 2] = v0
    results[0, 3] = 0.0
    
    t = 0.0
    for i in range(1, steps + 1):
        t += dt
        state = calc_exact_state(t, x0, v0, m, k, b)
        results[i, 0] = t
        results[i, 1] = state[0]
        results[i, 2] = state[1]
        results[i, 3] = 0.0
        
    return results

@njit
def solve_euler(x0, v0, m, k, b, ts, t_end):
    """
    Forward Euler integration.
    """
    steps = int(np.floor(t_end / ts))
    results = np.zeros((steps + 1, 4))
    
    results[0, 0] = 0.0
    results[0, 1] = x0
    results[0, 2] = v0
    results[0, 3] = 0.0
    
    t = 0.0
    state = np.array([x0, v0], dtype=np.float64)
    
    for i in range(1, steps + 1):
        dydt = calc_derivatives(t, state, m, k, b)
        state[0] += ts * dydt[0]
        state[1] += ts * dydt[1]
        t += ts
        
        exact = calc_exact_state(t, x0, v0, m, k, b)
        error = state[0] - exact[0]
        
        results[i, 0] = t
        results[i, 1] = state[0]
        results[i, 2] = state[1]
        results[i, 3] = error
        
    return results

@njit
def solve_rk2(x0, v0, m, k, b, ts, t_end):
    """
    Second-Order Runge-Kutta (Midpoint Method).
    """
    steps = int(np.floor(t_end / ts))
    results = np.zeros((steps + 1, 4))
    
    results[0, 0] = 0.0
    results[0, 1] = x0
    results[0, 2] = v0
    results[0, 3] = 0.0
    
    t = 0.0
    state = np.array([x0, v0], dtype=np.float64)
    
    for i in range(1, steps + 1):
        k1 = calc_derivatives(t, state, m, k, b)
        
        state_half = np.array([state[0] + 0.5 * ts * k1[0], state[1] + 0.5 * ts * k1[1]], dtype=np.float64)
        k2 = calc_derivatives(t + 0.5 * ts, state_half, m, k, b)
        
        state[0] += ts * k2[0]
        state[1] += ts * k2[1]
        t += ts
        
        exact = calc_exact_state(t, x0, v0, m, k, b)
        error = state[0] - exact[0]
        
        results[i, 0] = t
        results[i, 1] = state[0]
        results[i, 2] = state[1]
        results[i, 3] = error
        
    return results

@njit
def solve_rk4(x0, v0, m, k, b, ts, t_end):
    """
    Fourth-Order Runge-Kutta (Classical RK4).
    """
    steps = int(np.floor(t_end / ts))
    results = np.zeros((steps + 1, 4))
    
    results[0, 0] = 0.0
    results[0, 1] = x0
    results[0, 2] = v0
    results[0, 3] = 0.0
    
    t = 0.0
    state = np.array([x0, v0], dtype=np.float64)
    
    for i in range(1, steps + 1):
        k1 = calc_derivatives(t, state, m, k, b)
        
        state_k2 = np.array([state[0] + 0.5 * ts * k1[0], state[1] + 0.5 * ts * k1[1]], dtype=np.float64)
        k2 = calc_derivatives(t + 0.5 * ts, state_k2, m, k, b)
        
        state_k3 = np.array([state[0] + 0.5 * ts * k2[0], state[1] + 0.5 * ts * k2[1]], dtype=np.float64)
        k3 = calc_derivatives(t + 0.5 * ts, state_k3, m, k, b)
        
        state_k4 = np.array([state[0] + ts * k3[0], state[1] + ts * k3[1]], dtype=np.float64)
        k4 = calc_derivatives(t + ts, state_k4, m, k, b)
        
        state[0] += (ts / 6.0) * (k1[0] + 2.0 * k2[0] + 2.0 * k3[0] + k4[0])
        state[1] += (ts / 6.0) * (k1[1] + 2.0 * k2[1] + 2.0 * k3[1] + k4[1])
        t += ts
        
        exact = calc_exact_state(t, x0, v0, m, k, b)
        error = state[0] - exact[0]
        
        results[i, 0] = t
        results[i, 1] = state[0]
        results[i, 2] = state[1]
        results[i, 3] = error
        
    return results

@njit
def solve_dp45(x0, v0, m, k, b, ts, t_end):
    """
    Runge-Kutta-Fehlberg 4/5 (Dormand-Prince adaptive time step method).
    """
    sf = 0.9
    tol = 1e-4
    
    t = 0.0
    state = np.array([x0, v0], dtype=np.float64)
    dt = ts
    
    # Butcher tableau values
    c = np.array([0.0, 1/5, 3/10, 4/5, 8/9, 1.0, 1.0])
    
    a = np.zeros((7, 7))
    a[1, 0] = 1/5
    a[2, 0] = 3/40
    a[2, 1] = 9/40
    a[3, 0] = 44/45
    a[3, 1] = -56/15
    a[3, 2] = 32/9
    a[4, 0] = 19372/6561
    a[4, 1] = -25360/2187
    a[4, 2] = 64448/6561
    a[4, 3] = -212/729
    a[5, 0] = 9017/3168
    a[5, 1] = -355/33
    a[5, 2] = 46732/5247
    a[5, 3] = 49/176
    a[5, 4] = -5103/18656
    a[6, 0] = 35/384
    a[6, 1] = 0.0
    a[6, 2] = 500/1113
    a[6, 3] = 125/192
    a[6, 4] = -2187/6784
    a[6, 5] = 11/84
    
    b_sol = np.array([35/384, 0.0, 500/1113, 125/192, -2187/6784, 11/84, 0.0])
    b_hat = np.array([5179/57600, 0.0, 7571/16695, 393/640, -92097/339200, 187/2100, 1/40])
    
    # Allocate a large array for adaptive output
    max_steps = 20000
    results = np.zeros((max_steps, 4))
    
    results[0, 0] = 0.0
    results[0, 1] = x0
    results[0, 2] = v0
    results[0, 3] = 0.0
    
    step_idx = 1
    
    while t < t_end and step_idx < max_steps:
        dt = min(dt, t_end - t)
        
        # Calculate stages
        ks = np.zeros((7, 2))
        for i in range(7):
            delta_x = np.zeros(2)
            for j in range(i):
                delta_x += ks[j] * (a[i, j] * dt)
            
            ks[i] = calc_derivatives(t + c[i] * dt, state + delta_x, m, k, b)
            
        # Calculate the 4th and 5th order step updates
        dx = np.zeros(2)
        dx_hat = np.zeros(2)
        for i in range(7):
            dx += ks[i] * (b_sol[i] * dt)
            dx_hat += ks[i] * (b_hat[i] * dt)
            
        # Difference gives the error estimate
        diff = dx - dx_hat
        error = np.sqrt(diff[0]**2 + diff[1]**2)
        
        # Accept step if error is within tolerance
        if error <= tol:
            state += dx
            t += dt
            
            exact = calc_exact_state(t, x0, v0, m, k, b)
            y_hat = state[0] - exact[0]
            
            results[step_idx, 0] = t
            results[step_idx, 1] = state[0]
            results[step_idx, 2] = state[1]
            results[step_idx, 3] = y_hat
            step_idx += 1
            
        # Update time step
        factor = tol / max(error, 1e-15)
        dt *= sf * (factor ** 0.2)
        
        # Avoid extremely small time steps
        if dt < 1e-6:
            dt = 1e-6
            
    return results[:step_idx]
