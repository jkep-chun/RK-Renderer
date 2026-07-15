# Runge-Kutta Stability Renderer

This program compares the performance of Forward Euler's method against 2nd-order midpoint Runge-Kutta and the classic 4th-order Runge-Kutta on a configurable damped harmonic oscillator whose exact analytical solution is known.

Granted, this is a linear system, and if the intent was to achieve as accurate as possible a solution, one could simply use a state transition matrix. However, the purpose is simply to improve the author's familiarity with numerical methods, differential equations, HTML, and JavaScript. So for now, it is sufficient to show that Euler's method and the Runge-Kutta schemes differ in accuracy.

Furthermore, being so contrived, this project would be more aptly titled "Explicit Runge-Kutta Stability Renderer", since the author's knowledge of differential equations belongs solely in the non-stiff realm.

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

$$
m\ddot{x} + b\dot{x} + kx = 0
$$

Coupling the position and velocity in state-space form, where $\mathbf{y}$ is the state vector, gives the advantage of 'feedback' from all states to correct error*.

$$
\mathbf{y}(t) = \begin{bmatrix} x(t) \\ v(t) \end{bmatrix}, \quad \frac{d\mathbf{y}}{dt} = \mathbf{f}(t, \mathbf{y}) = \begin{bmatrix} v(t) \\ -\frac{b}{m}v(t) - \frac{k}{m}x(t) \end{bmatrix}
$$

We use this equation to find the state vector's time derivative as a function of state and time, from which a numerical method computes a future state, given a time step, and so the cycle repeats.

More generally, for an $n$-th order SISO system, we can model the internal dynamics as

$$
\dot{\mathbf{x}}(t) = \mathbf{Ax}(t) + \mathbf{B}u(t)
$$

where $\mathbf{x}(t)$ is the $n\times1$ state vector, $\mathbf{A}$ the $n \times n$ system matrix, $\mathbf{B}$ the $n \times 1$ input matrix, and $u(t)$ the input function.

### Numerical Approximation Methods

#### 1. Forward Euler

Updates the state based on the gradient at the start of the step:

$$
\mathbf{y}_{i+1} = \mathbf{y}_i + \Delta t \mathbf{f}(t_i,\mathbf{y}_i)
$$

* **Global Error**: $\mathcal{O}(\Delta t)$

#### 2. Runge-Kutta 2 (RK2, Midpoint Method)

Updates the state based on the gradient evaluated at the midpoint of the step:

$$
\begin{aligned}
\mathbf{k}_1 &= \mathbf{f}(t_i,\mathbf{y}_i) \\
\mathbf{k}_2 &= \mathbf{f}\left(t_i + \frac{\Delta t}{2},\mathbf{y}_i + \frac{\Delta t}{2}\mathbf{k}_1\right) \\
\mathbf{y}_{i+1} &= \mathbf{y}_i + \Delta t  \mathbf{k}_2
\end{aligned}
$$

* **Global Error**: $\mathcal{O}(\Delta t^2)$

#### 3. Runge-Kutta 4 (RK4, Classic)

Updates the state using a weighted average of four gradients:

$$
\begin{aligned}
\mathbf{k}_1     &= \mathbf{f}(t_i, \mathbf{y}_i) \\
\mathbf{k}_2     &= \mathbf{f}\left(t_i + \frac{\Delta t}{2},\mathbf{y}_i + \frac{\Delta t}{2}\mathbf{k}_1\right) \\
\mathbf{k}_3     &= \mathbf{f}\left(t_i + \frac{\Delta t}{2},\mathbf{y}_i + \frac{\Delta t}{2}\mathbf{k}_2\right) \\
\mathbf{k}_4     &= \mathbf{f}(t_i + \Delta t,\mathbf{y}_i + \Delta t\mathbf{k}_3) \\
\mathbf{y}_{i+1} &= \mathbf{y}_i + \frac{\Delta t}{6}(\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4) \\
\end{aligned}
$$

* **Global Error**: $\mathcal{O}(\Delta t^4)$

### Error Analysis

The global error for the Forward Euler and RK4 methods will be derived analytically for illustration.

#### Taylor Series

Likely familiar from Calculus II is the Taylor Series expansion.

$$
f(x)=f(a)+\frac{f'(a)}{1!}(x-a)+\frac{f''(a)}{2!}(x-a)^2+...=\sum_{i=0}^{\infty} \frac{f^{(i)}(a)}{i!}(x-a)^i
$$

Making the substitutions $f(x)=\mathbf{y}(x)$, $x=t_n+\Delta t$, and $a=t_n$, we get

$$
\mathbf{y}(t_n+\Delta t)=\mathbf{y}_n + \frac{\dot{\mathbf{y}}_n}{1!}\Delta t + \frac{\ddot{\mathbf{y}}_n}{2!}\Delta t^2 +...=\sum_{i=0}^{\infty}\frac{\mathbf{y}_n^{(i)}}{i!}\Delta t^i
$$

where $\mathbf{y}_n^{(i)}$ denotes the $i\text{th}$ time derivative.

Write out enough terms of the sequence, and the expression will converge to the true value. Thus, to compare approximation methods, we will find their error relative to this Taylor Series. We choose to denote the true next value as $\mathbf{y}(t_n + \Delta t)$ and the approximation as $\mathbf{y}_{n+1}$. Thus, the magnitude of the local error (for each time step) can be found as

$$
\mathbf{e}_{local} = \mathbf{y}(t_n + \Delta t) - \mathbf{y}_{n+1}.
$$

The global error is proportional to this by $1/\Delta t$.

#### Forward Euler

The Forward Euler difference equation is simply

$$
\mathbf{y}_{n+1} = \mathbf{y}_n + \mathbf{y}_n^{(1)} \Delta t.
$$

Thus we find the local and global errors to be

$$
\mathbf{e}_{local} = \mathcal{O}(\Delta t^2),\quad \mathbf{e}_{global}=\mathcal{O}(\Delta t).
$$

#### Runge-Kutta 2 (Midpoint Method)

The generalized Runge-Kutta 2 difference equation is

$$
\mathbf{y}_{n+1} = \mathbf{y}_n + \Delta t(b_1\mathbf{k}_1 + b_2\mathbf{k}_2)
$$

where

$$
\begin{aligned}
\mathbf{k}_1 &= \mathbf{f}(t, \mathbf{y}) \\
\mathbf{k}_2 &= \mathbf{f}(t + \alpha\Delta t,\mathbf{y}_n + \beta\Delta t\mathbf{k}_1).
\end{aligned}
$$

After substitution, taking the error and matching coefficients, the constraints minimizing error are

$$
\begin{aligned}
b_1 + b_2   &= 1    \\
\alpha      &= 1/2  \\
b_2\beta  &= 1/2,
\end{aligned}
$$

and choosing $\beta = 1/2$ gives the midpoint method, which we employ.

---

## Potential Next Steps

The current state of the program meets the author's intent. However, in the course of research, new areas for improvement to keep up with more sophisticated numerical methods (and a better UI) were taken note of here.

*Adaptive Time Steps*

- A higher/lower order pair of computations to check error tolerance and adjust subsequent intervals.
- An ambitious goal would be implementing the Dormand-Prince method.

*Toggle Uniform Tolerance or Uniform Intervals*

- For comparison of numerical methods, see behavior when intervals chosen to meet a universal tolerance or when intervals are equal across methods (might be infeasible or a poor comparison)

*Simulation Time Animation*

- An option to draw the plot in simulation time.
