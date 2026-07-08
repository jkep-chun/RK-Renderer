# Runge-Kutta Stability Renderer

This program compares the performance of Forward Euler's method against 2nd-order midpoint Runge-Kutta (RK2) and the classic 4th-order Runge-Kutta (RK4) using a configurable damped harmonic oscillator whose exact analytical solution is known.

The purpose is to improve the author's familiarity with numerical methods, differential equations, HTML, and JavaScript.

---

## Parameters

| Parameter               | Symbol     |
|:----------------------- |:---------- |
| **Initial position**    | $x_0$      |
| **Initial velocity**    | $v_0$      |
| **Mass**                | $m$        |
| **Spring constant**     | $k$        |
| **Damping coefficient** | $b$        |
| **Sampling interval**   | $\Delta t$ |
| **Simulation duration** | $T$        |

---

## Mathematical Background

### System Model

The system is a second-order linear homogeneous ordinary differential equation representing a spring-mass-damper system:

$m\ddot{x} + b\dot{x} + kx = 0$

Coupling the position and velocity in state-space form, where $\mathbf{y}$ is the state vector, gives the advantage of 'feedback' of [the states] to correct [certain error].

$\mathbf{y}(t) = \begin{bmatrix} x(t) \\ v(t) \end{bmatrix}, \quad \frac{d\mathbf{y}}{dt} = f(t, \mathbf{y}) = \begin{bmatrix} v(t) \\ -\frac{b}{m}v(t) - \frac{k}{m}x(t) \end{bmatrix}$

#### 1. Forward Euler

Updates the state based on the gradient at the start of the step:
$\mathbf{y}_{i+1} = \mathbf{y}_i + \Delta t \, f(t_i, \mathbf{y}_i)$

* **Global Error**: $\mathcal{O}(\Delta t)$

#### 2. Runge-Kutta 2 (RK2, Midpoint Method)

Updates the state based on the gradient evaluated at the midpoint of the step:
$
\begin{aligned}
\mathbf{k}_1 &= f(t_i, \mathbf{y}_i) \\
\mathbf{k}_2 &= f\left(t_i + \frac{\Delta t}{2}, \mathbf{y}_i + \frac{\Delta t}{2}\mathbf{k}_1\right) \\
\mathbf{y}_{i+1} &= \mathbf{y}_i + \Delta t \, \mathbf{k}_2
\end{aligned}
$

* **Global Error**: $\mathcal{O}(\Delta t^2)$

#### 3. Runge-Kutta 4 (RK4, Classic)

Updates the state using a weighted average of four gradients:
$
\begin{aligned}
\mathbf{k}_1 &= f(t_i, \mathbf{y}_i) \\
\mathbf{k}_2 &= f\left(t_i + \frac{\Delta t}{2}, \mathbf{y}_i + \frac{\Delta t}{2}\mathbf{k}_1\right) \\
\mathbf{k}_3 &= f\left(t_i + \frac{\Delta t}{2}, \mathbf{y}_i + \frac{\Delta t}{2}\mathbf{k}_2\right) \\
\mathbf{k}_4 &= f(t_i + \Delta t, \mathbf{y}_i + \Delta t\mathbf{k}_3) \\
\mathbf{y}_{i+1} &= \mathbf{y}_i + \frac{\Delta t}{6}(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4) \\
\end{aligned}
$

* **Global Error**: $\mathcal{O}(\Delta t^4)$

### Error Analysis

The global error for the Forward Euler and RK4 methods will be derived analytically for illustration.

---

## Improvements

The current state of the program meets the author's intent. However, in the course of research, new areas for improvement to keep up with more sophisticated numerical methods (and a better UI) were taken note of here.

*Adaptive Time Steps*

- A higher/lower order pair of computations to check error tolerance and adjust subsequent intervals.

*Toggle Uniform Tolerance or Uniform Intervals*

- For comparison of numerical methods, see behavior when intervals chosen to meet a universal tolerance or when intervals are equal across methods.

*Simulation Time Animation*

- An option to draw the plot in simulation time.
