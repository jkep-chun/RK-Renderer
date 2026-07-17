import numpy as np
from numba import njit

@njit
def calc_derivatives(t, state, m, k, b):
    """
    Coupled State-Space Derivative Function f(t, x) for Damped Harmonic Oscillator
    State array: [position, velocity]
    """
    x, v = state[0], state[1]
    dx_dt = v
    dv_dt = (-k * x - b * v) / m
    return np.array([dx_dt, dv_dt], dtype=np.float64)

@njit
def calc_exact_state(t, x0, v0, m, k, b):
    """
    Exact Analytical Solver for Damped Harmonic Oscillator at a specific time t.
    Returns array: [position, velocity]
    """
    discriminant = b * b - 4 * m * k
    
    if discriminant > 1e-9:
        # Overdamped case
        r1 = (-b + np.sqrt(discriminant)) / (2 * m)
        r2 = (-b - np.sqrt(discriminant)) / (2 * m)
        a1 = (r2 * x0 - v0) / (r2 - r1)
        a2 = x0 - a1
        x = a1 * np.exp(r1 * t) + a2 * np.exp(r2 * t)
        v = a1 * r1 * np.exp(r1 * t) + a2 * r2 * np.exp(r2 * t)
        return np.array([x, v], dtype=np.float64)
        
    elif abs(discriminant) <= 1e-9:
        # Critically damped case
        r = -b / (2 * m)
        a1 = x0
        a2 = v0 - a1 * r
        x = (a1 + a2 * t) * np.exp(r * t)
        v = (a1 + a2 * t) * r * np.exp(r * t) + a2 * np.exp(r * t)
        return np.array([x, v], dtype=np.float64)
        
    else:
        # Underdamped case
        omega = np.sqrt(4 * m * k - b * b) / (2 * m)
        alpha = -b / (2 * m)
        a1 = (v0 - alpha * x0) / omega
        a2 = x0
        
        exp_factor = np.exp(alpha * t)
        cos_val = np.cos(omega * t)
        sin_val = np.sin(omega * t)
        
        x = exp_factor * (a2 * cos_val + a1 * sin_val)
        v = exp_factor * (
            a2 * (alpha * cos_val - omega * sin_val) + 
            a1 * (alpha * sin_val + omega * cos_val)
        )
        return np.array([x, v], dtype=np.float64)
