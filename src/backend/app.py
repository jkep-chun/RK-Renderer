import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .solver import solve_exact, solve_euler, solve_rk2, solve_rk4, solve_dp45

app = FastAPI(title="ODE Stability Renderer API")

# Enable CORS for local testing/cross-origin frontend hosting
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationParams(BaseModel):
    x0: float = 1.0
    v0: float = 0.0
    m: float = 0.1
    k: float = 1.0
    b: float = 0.1
    ts: float = 0.1
    t_end: float = 10.0

def format_results(arr):
    """
    Convert a numpy array of shape (N, 4) containing [t, x, v, e]
    into a list of dictionaries compatible with the frontend.
    """
    return [
        {"t": float(row[0]), "x": float(row[1]), "v": float(row[2]), "e": float(row[3])}
        for row in arr
    ]

@app.post("/api/solve")
def solve_post(params: SimulationParams):
    """
    Solve the ODE using all methods based on POST JSON parameters.
    """
    exact = solve_exact(params.x0, params.v0, params.m, params.k, params.b, params.ts, params.t_end)
    euler = solve_euler(params.x0, params.v0, params.m, params.k, params.b, params.ts, params.t_end)
    rk2 = solve_rk2(params.x0, params.v0, params.m, params.k, params.b, params.ts, params.t_end)
    rk4 = solve_rk4(params.x0, params.v0, params.m, params.k, params.b, params.ts, params.t_end)
    dp45 = solve_dp45(params.x0, params.v0, params.m, params.k, params.b, params.ts, params.t_end)
    
    return {
        "exact": format_results(exact),
        "euler": format_results(euler),
        "rk2": format_results(rk2),
        "rk4": format_results(rk4),
        "dp45": format_results(dp45),
    }

@app.get("/api/solve")
def solve_get(
    x0: float = 1.0,
    v0: float = 0.0,
    m: float = 0.1,
    k: float = 1.0,
    b: float = 0.1,
    ts: float = 0.1,
    t_end: float = 10.0,
):
    """
    Solve the ODE using all methods based on GET query parameters.
    """
    exact = solve_exact(x0, v0, m, k, b, ts, t_end)
    euler = solve_euler(x0, v0, m, k, b, ts, t_end)
    rk2 = solve_rk2(x0, v0, m, k, b, ts, t_end)
    rk4 = solve_rk4(x0, v0, m, k, b, ts, t_end)
    dp45 = solve_dp45(x0, v0, m, k, b, ts, t_end)
    
    return {
        "exact": format_results(exact),
        "euler": format_results(euler),
        "rk2": format_results(rk2),
        "rk4": format_results(rk4),
        "dp45": format_results(dp45),
    }

# Mount static files of frontend.
# Make sure this is registered last so it doesn't shadow api routes.
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.backend.app:app", host="0.0.0.0", port=8000, reload=True)
